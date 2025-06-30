import {
  ADD_PENDING_DOCUMENT_MUTATION,
  UPDATE_DOCS_MUTATION,
} from "@/src/constants";
import { getApiReferenceTemplate } from "@/src/utils/docs/get-api-reference-template";
// import { getTinaEndpoint } from "@/src/utils/get-tina-endpoint";
import { type NextRequest, NextResponse } from "next/server";
import { sanitizeFileName } from "../../../utils/sanitizeFilename";

export const insertContent = async (
  relativePath: string,
  title: string,
  description: string,
  endpoint: any,
  schema: string
) => {
  return getApiReferenceTemplate(endpoint, schema);
};

interface EndpointData {
  id: string;
  label: string;
  method: string;
  path: string;
  summary: string;
  description: string;
}

interface GroupApiData {
  schema: string;
  tag: string;
  endpoints: EndpointData[];
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

const updateAPIReferenceMDXFilesInGraphQL = async (
  relativePath: string,
  endpoint: any,
  schema: string
) => {
  const tinaEndpoint = "http://localhost:4001/graphql"; //getTinaEndpoint();

  if (!tinaEndpoint) {
    throw new Error("Missing TinaCMS configuration for file deletion");
  }

  // Create title from summary or generate one
  const title = endpoint.summary || `${endpoint.method} ${endpoint.path}`;
  const description =
    endpoint.description ||
    `API endpoint for ${endpoint.method} ${endpoint.path}`;

  // Now try to update it with content
  try {
    const updateMutation = UPDATE_DOCS_MUTATION;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.TINA_TOKEN}`,
    };

    const variables = {
      relativePath: relativePath,
      params: await insertContent(
        relativePath,
        title,
        description,
        endpoint,
        schema
      ), // returns the correct object
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

const generateMDXTemplate = (endpoint: EndpointData) => {
  const title = endpoint.summary || `${endpoint.method} ${endpoint.path}`;
  const description =
    endpoint.description ||
    `API endpoint for ${endpoint.method} ${endpoint.path}`;

  // Process description to wrap curly bracket parts with backticks
  const processedDescription = description.replace(/\{([^}]+)\}/g, "`{$1}`");
  return `---
title: "${title}"
last_edited: "${new Date().toISOString()}"
seo:
  title: "${title}"
  description: "${description}"
---
---
title: "${title}"
last_edited: "${new Date().toISOString()}"
seo:
  title: "${title}"
  description: "${description}"
---
${
  processedDescription ||
  `Documentation for ${endpoint.method} ${endpoint.path}`
}
## Endpoint Details

**Method:** \`${endpoint.method}\`
**Path:** \`${endpoint.path}\`

## API Reference

<apiReference schemaFile="Swagger-Petstore.json|${endpoint.method}:${
    endpoint.path
  }" />`;
};

/**
 * Generates a safe filename from endpoint data
 */
function generateFileName(endpoint: EndpointData): string {
  const method = endpoint.method.toLowerCase();
  const pathSafe = endpoint.path
    .replace(/^\//, "") // Remove leading slash
    .replace(/\//g, "-") // Replace slashes with dashes
    .replace(/[{}]/g, "") // Remove curly braces
    .replace(/[^\w-]/g, "") // Remove any non-word characters except dashes
    .toLowerCase();

  return `${method}-${pathSafe}`;
}

/**
 * Helper function to generate API documentation files
 */
async function generateApiDocsFiles(groupData: any): Promise<string[]> {
  // Dynamic import to reduce bundle size
  const fs = await import("node:fs");
  const path = await import("node:path");

  if (!groupData.endpoints || groupData.endpoints.length === 0) {
    return [];
  }

  const { schema, tag, endpoints } = groupData;
  const createdFiles: string[] = [];

  const tagDir = `api-documentation/${sanitizeFileName(tag)}`;
  const outputDir = path.join(
    process.cwd(),
    "content",
    "docs",
    "api-documentation",
    tagDir
  );

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const results = {
    success: true,
    createdFiles: [] as string[],
    errors: [] as string[],
  };

  for (const endpoint of endpoints) {
    const fileName = generateFileName(endpoint);
    const relativePath = path.join(tagDir, `${fileName}.mdx`);

    console.log("🚀 ~ generateApiDocsFiles ~ relativePath:", relativePath);
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
          const updateResult = await updateAPIReferenceMDXFilesInGraphQL(
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data } = body;

    // The data should be the navigation configuration object
    // Extract the tabs array from it
    const tabs = data?.tabs || [];

    if (!Array.isArray(tabs)) {
      return NextResponse.json(
        { error: "Invalid data format - expected tabs array" },
        { status: 400 }
      );
    }

    const allCreatedFiles: string[] = [];

    for (const item of tabs) {
      if (item._template === "apiTab") {
        // Process API groups within this tab
        for (const group of item.supermenuGroup || []) {
          if (group._template === "groupOfApiReferences" && group.apiGroup) {
            try {
              // Parse the group data
              let groupData: GroupApiData;
              try {
                groupData =
                  typeof group.apiGroup === "string"
                    ? JSON.parse(group.apiGroup)
                    : group.apiGroup;
              } catch (parseError) {
                continue; // Skip invalid data
              }

              // Generate files for this group
              const createdFiles = await generateApiDocsFiles(groupData);
              allCreatedFiles.push(...createdFiles);
            } catch (error) {
              // Continue processing other groups
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${tabs.length} navigation tabs`,
      totalFilesCreated: allCreatedFiles.length,
      createdFiles: allCreatedFiles,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to process navigation API groups",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
