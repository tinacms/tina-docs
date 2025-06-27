import { generateFileName } from "@/src/utils/generateFileName";
import { sanitizeFileName } from "@/src/utils/sanitizeFilename";
import { showNotification } from "@/src/utils/showNotification";
import { config } from "@/tina/config";

/**
 * Get TinaCMS authentication token
 */
export const getTinaCMSToken = (): string | null => {
  const tinacmsAuthString = localStorage.getItem("tinacms-auth");
  let token: string | null = null;
  try {
    const authData = tinacmsAuthString ? JSON.parse(tinacmsAuthString) : null;
    token = authData?.id_token || config.token || null;
  } catch (e) {
    token = config.token || null;
  }
  return token;
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

  // Get config values for logging purposes
  const clientId = config.clientId;
  const branch = config.branch;

  if (!clientId) {
    return {
      ...results,
      success: false,
      errors: ["Missing TinaCMS client ID in config"],
    };
  }

  if (!branch) {
    return {
      ...results,
      success: false,
      errors: ["Missing TinaCMS branch in config"],
    };
  }

  const token = getTinaCMSToken();
  const tinaEndpoint = `https://content.tinajs.io/1.5/content/${clientId}/github/${branch}`;

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
      const mutation = `
          mutation AddPendingDocument($collection: String!, $relativePath: String!) {
            addPendingDocument(collection: $collection, relativePath: $relativePath) {
              __typename
            }
          }
        `;

      const variables = {
        collection: "docs",
        relativePath,
      };

      // Prepare headers with authentication using TinaCMS internal pattern
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Add auth token using the internal TinaCMS pattern
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

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
          const updateMutation = `
              mutation UpdateDocs($relativePath: String!, $params: DocsMutation!) {
                updateDocs(relativePath: $relativePath, params: $params) {
                  __typename
                  id
                  title
                }
              }
            `;

          const updateVariables = {
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
                    children: [
                      { type: "text", text: `Method: ${endpoint.method}` },
                    ],
                  },
                  {
                    type: "p",
                    children: [
                      { type: "text", text: `Path: ${endpoint.path}` },
                    ],
                  },
                ],
              },
            },
          };

          await fetch(tinaEndpoint, {
            method: "POST",
            headers,
            body: JSON.stringify({
              query: updateMutation,
              variables: updateVariables,
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
  const clientId = config.clientId;
  const branch = config.branch;

  if (!clientId || !branch) {
    throw new Error("Missing TinaCMS configuration for file deletion");
  }

  const token = getTinaCMSToken();
  const tinaEndpoint = `https://content.tinajs.io/1.5/content/${clientId}/github/${branch}`;

  const mutation = `
      mutation DeleteDocument($collection: String!, $relativePath: String!) {
        deleteDocument(collection: $collection, relativePath: $relativePath) {
          __typename
        }
      }
    `;

  const variables = {
    collection: "docs",
    relativePath: filePath,
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

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
  const clientId = config.clientId;
  const branch = config.branch;

  if (!clientId || !branch) {
    throw new Error("Missing TinaCMS configuration for directory clearing");
  }

  const token = getTinaCMSToken();
  const tinaEndpoint = `https://content.tinajs.io/1.5/content/${clientId}/github/${branch}`;

  // TinaCMS relativePaths are relative to the collection root (content/docs)
  // So we need to remove the 'docs/' prefix for the query
  const relativeDirectoryPath = directoryPath.replace(/^docs\//, "");

  // Get all docs and filter in JavaScript since GraphQL filters don't work
  const listQuery = `
      query GetAllDocs {
        docsConnection {
          edges {
            node {
              id
              _sys {
                filename
                relativePath
              }
            }
          }
        }
      }
    `;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

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
