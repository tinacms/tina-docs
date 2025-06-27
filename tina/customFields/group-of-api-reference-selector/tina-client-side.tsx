import {
  ADD_PENDING_DOCUMENT_MUTATION,
  DELETE_DOCUMENT_MUTATION,
  GET_ALL_DOCS_QUERY,
  UPDATE_DOCS_MUTATION,
} from "@/src/constants";
import { generateFileName } from "@/src/utils/generateFileName";
import { getTinaEndpoint } from "@/src/utils/get-tina-endpoint";
import { sanitizeFileName } from "@/src/utils/sanitizeFilename";
import { showNotification } from "@/src/utils/showNotification";
import { config } from "@/tina/config";

const getBearerAuthHeader = (): Record<string, string> => {
  const tinacmsAuthString = localStorage.getItem("tinacms-auth");
  let token: string | null = null;
  try {
    const authData = tinacmsAuthString ? JSON.parse(tinacmsAuthString) : null;
    token = authData?.id_token || config.token || null;
  } catch (e) {
    token = config.token || null;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Handles TinaCMS file generation
 */
export const handleTinaCMSGeneration = async (
  inputValue: string,
  selectedEndpoints: any[]
) => {
  // Parse the group data
  let groupData: any;
  try {
    groupData =
      typeof inputValue === "string" ? JSON.parse(inputValue) : inputValue;
  } catch (error) {
    throw new Error("Invalid API group data format");
  }

  // Filter endpoints to only create the specified files
  const filteredEndpoints = groupData.endpoints.filter((endpoint: any) => {
    return selectedEndpoints.some((ep) => ep.id === endpoint.id);
  });

  // Create filtered group data for generation
  const filteredGroupData = {
    ...groupData,
    endpoints: filteredEndpoints,
  };

  // Call the client-side GraphQL function directly
  const results = await createDocsViaTinaClientSide(filteredGroupData);

  if (results.success) {
    showNotification(
      `✅ Created ${results.createdFiles.length} MDX files via TinaCMS`,
      "success"
    );
  } else {
    const errorMsg =
      results.errors.length > 0
        ? `Partially successful: created ${results.createdFiles.length} files, ${results.errors.length} errors`
        : "Failed to create files";
    showNotification(`⚠️ ${errorMsg}`, "warning");
  }
};

/**
 * Creates docs via TinaCMS GraphQL mutation - CLIENT SIDE
 */
export const createDocsViaTinaClientSide = async (
  groupData: any
): Promise<{
  success: boolean;
  createdFiles: string[];
  errors: string[];
}> => {
  const results = {
    success: true,
    createdFiles: [] as string[],
    errors: [] as string[],
  };

  if (!groupData.endpoints || groupData.endpoints.length === 0) {
    return { ...results, success: false, errors: ["No endpoints provided"] };
  }

  const { schema, tag, endpoints } = groupData;
  const tagDir = sanitizeFileName(tag);

  const tinaEndpoint = getTinaEndpoint();
  if (!tinaEndpoint) {
    return {
      ...results,
      success: false,
      errors: ["Missing TinaCMS configuration for file deletion"],
    };
  }

  for (const endpoint of endpoints) {
    try {
      const fileName = generateFileName(endpoint);
      const relativePath = `api-documentation/${tagDir}/${fileName}.mdx`;

      // Create title from summary or generate one
      const title = endpoint.summary || `${endpoint.method} ${endpoint.path}`;
      const description =
        endpoint.description ||
        `API endpoint for ${endpoint.method} ${endpoint.path}`;

      // Use fetch with the correct TinaCloud endpoint and auth token
      const mutation = ADD_PENDING_DOCUMENT_MUTATION;

      const variables = {
        collection: "docs",
        relativePath,
      };

      const headers = getBearerAuthHeader();
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

      const result = await response.json();

      if (result.errors) {
        const errorMessages = result.errors
          .map((e: any) => e.message)
          .join(", ");
        results.errors.push(
          `Failed to create ${relativePath}: ${errorMessages}`
        );
        results.success = false;
      } else if (result.data?.addPendingDocument) {
        results.createdFiles.push(relativePath);

        // Now try to update it with content
        try {
          const updateMutation = UPDATE_DOCS_MUTATION;

          const body = await insertContent(
            relativePath,
            title,
            description,
            endpoint
          );

          await fetch(tinaEndpoint, {
            method: "POST",
            headers,
            body: JSON.stringify({
              query: updateMutation,
              variables: {
                relativePath,
                params: body,
              },
            }),
          });
        } catch (updateError) {
          // Don't fail the overall operation for update errors
        }
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
  }

  return results;
};

/**
 * Delete file via TinaCMS GraphQL
 */
const deleteFileViaTinaCMS = async (filePath: string) => {
  const tinaEndpoint = getTinaEndpoint();

  if (!tinaEndpoint) {
    throw new Error("Missing TinaCMS configuration for file deletion");
  }

  const mutation = DELETE_DOCUMENT_MUTATION;

  const variables = {
    collection: "docs",
    relativePath: filePath,
  };

  const headers = getBearerAuthHeader();

  const response = await fetch(tinaEndpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      query: mutation,
      variables: variables,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  if (result.errors) {
    throw new Error(result.errors.map((e: any) => e.message).join(", "));
  }
};

/**
 * Clear directory via TinaCMS GraphQL (list and delete all files)
 */
export const clearDirectoryViaTinaCMS = async (directoryPath: string) => {
  const tinaEndpoint = getTinaEndpoint();

  if (!tinaEndpoint) {
    throw new Error("Missing TinaCMS configuration for file deletion");
  }

  // TinaCMS relativePaths are relative to the collection root (content/docs)
  // So we need to remove the 'docs/' prefix for the query
  const relativeDirectoryPath = directoryPath.replace(/^docs\//, "");

  // Get all docs and filter in JavaScript since GraphQL filters don't work
  const listQuery = GET_ALL_DOCS_QUERY;

  const headers = getBearerAuthHeader();

  const listResponse = await fetch(tinaEndpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      query: listQuery,
    }),
  });

  if (!listResponse.ok) {
    throw new Error(`Failed to list files: HTTP ${listResponse.status}`);
  }

  const listResult = await listResponse.json();
  if (listResult.errors) {
    throw new Error(
      `List query errors: ${listResult.errors
        .map((e: any) => e.message)
        .join(", ")}`
    );
  }

  // Filter files in JavaScript to find ones in our target directory
  const allFiles = listResult.data?.docsConnection?.edges || [];

  const filesToDelete = allFiles.filter((edge: any) => {
    const relativePath = edge.node._sys.relativePath;
    const matches = relativePath?.startsWith(`${relativeDirectoryPath}/`);
    return matches;
  });

  for (const edge of filesToDelete) {
    const relativePath = edge.node._sys.relativePath;
    try {
      await deleteFileViaTinaCMS(relativePath);
    } catch (error) {
      // Continue processing other files
    }
  }
};

export const insertContent = async (
  relativePath: string,
  title: string,
  description: string,
  endpoint: any
) => {
  return {
    relativePath,
    params: {
      title,
      last_edited: new Date().toISOString(),
      seo: {
        title,
        description,
      },
      // Add basic structured content
      body: {
        type: "root",
        children: [
          {
            type: "h1",
            children: [{ type: "text", text: title }],
          },
          {
            type: "p",
            children: [
              {
                type: "text",
                text:
                  description ||
                  `Documentation for ${endpoint.method} ${endpoint.path}`,
              },
            ],
          },
          {
            type: "p",
            children: [{ type: "text", text: `Method: ${endpoint.method}` }],
          },
          {
            type: "p",
            children: [{ type: "text", text: `Path: ${endpoint.path}` }],
          },
        ],
      },
    },
  };
};
