import {
  ADD_PENDING_DOCUMENT_MUTATION,
  UPDATE_DOCS_MUTATION,
} from "@/src/constants";
import { getApiReferenceTemplate } from "@/src/utils/docs/get-api-reference-template";
import { sanitizeFileName } from "@/src/utils/sanitizeFilename";
import type { EndpointData } from "./types";

/**
 * Generates a safe filename from endpoint data
 */
export function generateAPIEndpointFileName(endpoint: EndpointData): string {
  const method = endpoint.method.toLowerCase();
  const pathSafe = endpoint.path
    .replace(/^\//, "") // Remove leading slash
    .replace(/\//g, "-") // Replace slashes with dashes
    .replace(/[{}]/g, "") // Remove curly braces
    .replace(/[^\w-]/g, "") // Remove any non-word characters except dashes
    .toLowerCase();

  return `${method}-${pathSafe}`;
}

const createAPIReferenceMDXFilesInGraphQL = async (
  collection: string,
  relativePath: string
) => {
  const tinaEndpoint = "http://localhost:4001/graphql"; //getTinaEndpoint();

  if (!tinaEndpoint) {
    throw new Error("Missing TinaCMS configuration for file deletion");
  }

  // Use fetch with the correct TinaCloud endpoint and auth token
  const mutation = ADD_PENDING_DOCUMENT_MUTATION;

  const variables = {
    collection,
    relativePath,
  };

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.TINA_TOKEN}`,
  };

  try {
    const response = await fetch(tinaEndpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: mutation,
        variables: variables,
      }),
    });

    if (!response.ok) {
      let errorDetails = `HTTP error! status: ${response.status}`;
      try {
        const errorBody = await response.text();
        if (errorBody) {
          errorDetails += ` - Response: ${errorBody}`;
        }
      } catch (e) {
        // Ignore if we can't read the response body
      }
      throw new Error(errorDetails);
    }
    return await response.json();
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: <explanation>
    console.error("Fetch error:", error);
    return {
      errors: [error],
    };
  }
};

export const updateAPIReferenceMDXFilesInGraphQL = async (
  relativePath: string,
  endpoint: any,
  schema: string
) => {
  const tinaEndpoint = "http://localhost:4001/graphql"; //getTinaEndpoint();

  if (!tinaEndpoint) {
    throw new Error("Missing TinaCMS configuration for file deletion");
  }

  // Now try to update it with content
  try {
    const updateMutation = UPDATE_DOCS_MUTATION;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.TINA_TOKEN}`,
    };

    const variables = {
      relativePath: relativePath,
      params: await getApiReferenceTemplate(endpoint, schema), // returns the correct object
    };

    await fetch(tinaEndpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: updateMutation,
        variables,
      }),
    });
  } catch (updateError) {
    // Don't fail the overall operation for update errors
  }
};

/**
 * Helper function to generate API documentation files
 */
export async function generateApiDocsFiles(groupData: any): Promise<string[]> {
  if (!groupData.endpoints || groupData.endpoints.length === 0) {
    return [];
  }

  const { schema, tag, endpoints } = groupData;
  const createdFiles: string[] = [];

  const path = `api-documentation/${sanitizeFileName(tag)}`;

  const results = {
    success: true,
    createdFiles: [] as string[],
    errors: [] as string[],
  };

  for (const endpoint of endpoints) {
    const fileName = generateAPIEndpointFileName(endpoint);
    const relativePath = `${path}/${fileName}.mdx`;

    try {
      const result = await createAPIReferenceMDXFilesInGraphQL(
        "docs",
        relativePath
      );

      if (result.errors) {
        const errorMessages = result.errors
          .map((e: any) => e.message)
          .join(", ");

        if (errorMessages.includes("already exists")) {
          await updateAPIReferenceMDXFilesInGraphQL(
            relativePath,
            endpoint,
            schema
          );
        } else {
          results.errors.push(
            `Failed to create ${relativePath}: ${errorMessages}`
          );
          results.success = false;
        }
      } else if (result.data?.addPendingDocument) {
        results.createdFiles.push(relativePath);

        await updateAPIReferenceMDXFilesInGraphQL(
          relativePath,
          endpoint,
          schema
        );
      } else {
        results.errors.push(
          `Failed to create ${relativePath}: No data returned`
        );
        results.success = false;
      }
    } catch (error) {
      const errorMsg = `Failed to create file for ${endpoint.method} ${
        endpoint.path
      }: ${error instanceof Error ? error.message : "Unknown error"}`;
      results.errors.push(errorMsg);
      results.success = false;
    }

    if (results.success) {
      createdFiles.push(relativePath);
    }
  }

  return createdFiles;
}
