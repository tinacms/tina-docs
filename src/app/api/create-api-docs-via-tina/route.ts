import { NextRequest, NextResponse } from "next/server";

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
 * Sanitizes a string to be used as a directory/file name
 */
function sanitizeFileName(name: string): string {
  return name
    .replace(/[^\w\s-]/g, "") // Remove special characters except spaces and dashes
    .replace(/\s+/g, "-") // Replace spaces with dashes
    .toLowerCase();
}

/**
 * Creates docs via TinaCMS GraphQL mutation
 */
async function createDocsViaTina(
  groupData: GroupApiData,
  req: NextRequest
): Promise<{ success: boolean; createdFiles: string[]; errors: string[] }> {
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

  // Determine the correct TinaCMS GraphQL endpoint based on environment
  let tinaEndpoint: string;

  if (process.env.NODE_ENV === "development") {
    // In development, use local TinaCMS server
    tinaEndpoint = "http://localhost:4001/graphql";
  } else {
    // In staging/production, construct the full URL to the admin GraphQL endpoint
    const url = new URL(req.url);
    tinaEndpoint = `${url.protocol}//${url.host}/admin/api/graphql`;
  }

  console.log(
    `Using TinaCMS endpoint: ${tinaEndpoint} (NODE_ENV: ${process.env.NODE_ENV})`
  );

  // Check for authentication token
  const tinaToken = process.env.TINA_TOKEN;
  if (!tinaToken && process.env.NODE_ENV !== "development") {
    return {
      ...results,
      success: false,
      errors: [
        "TINA_TOKEN environment variable is required for staging/production environments",
      ],
    };
  }

  // Clean up the token (remove quotes, whitespace, etc.)
  let cleanToken = "";
  let debugInfo = "";
  if (tinaToken) {
    cleanToken = tinaToken.trim().replace(/^["']|["']$/g, ""); // Remove surrounding quotes and whitespace
    debugInfo = `Token info - Length: ${
      cleanToken.length
    }, Token starts with: ${cleanToken.substring(0, 20)}...`;
  }

  // Prepare headers for GraphQL requests
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // For the admin endpoint, we don't need to manually add auth headers
  // The TinaCMS admin handles authentication internally

  for (const endpoint of endpoints) {
    try {
      const fileName = generateFileName(endpoint);
      const relativePath = `api-documentation/${tagDir}/${fileName}.mdx`;

      // Create title from summary or generate one
      const title = endpoint.summary || `${endpoint.method} ${endpoint.path}`;
      const description =
        endpoint.description ||
        `API endpoint for ${endpoint.method} ${endpoint.path}`;

      // First, try to create using addPendingDocument (simpler, no content)
      const simpleMutation = `
        mutation AddPendingDocument($collection: String!, $relativePath: String!) {
          addPendingDocument(collection: $collection, relativePath: $relativePath) {
            __typename
          }
        }
      `;

      const simpleVariables = {
        collection: "docs",
        relativePath,
      };

      // Make GraphQL request to TinaCMS
      const response = await fetch(tinaEndpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
          query: simpleMutation,
          variables: simpleVariables,
        }),
      });

      if (!response.ok) {
        // Try to get more detailed error information
        let errorDetails = `HTTP error! status: ${response.status}`;
        try {
          const errorBody = await response.text();
          if (errorBody) {
            errorDetails += ` - Response: ${errorBody}`;
            // If it's a JWT error, add our debug info
            if (errorBody.includes("JWT") || errorBody.includes("token")) {
              errorDetails += ` | Debug: ${debugInfo}`;
            }
          }
        } catch (e) {
          // Ignore if we can't read the response body
        }
        throw new Error(errorDetails);
      }

      const result = await response.json();

      if (result.errors) {
        results.errors.push(
          `Failed to create ${relativePath}: ${result.errors
            .map((e: any) => e.message)
            .join(", ")}`
        );
        results.success = false;
      } else if (result.data?.addPendingDocument) {
        results.createdFiles.push(relativePath);
        console.log(`Created pending document via TinaCMS: ${relativePath}`);

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
              // Skip body for now to avoid rich text issues
            },
          };

          const updateResponse = await fetch(tinaEndpoint, {
            method: "POST",
            headers,
            body: JSON.stringify({
              query: updateMutation,
              variables: updateVariables,
            }),
          });

          if (updateResponse.ok) {
            const updateResult = await updateResponse.json();
            if (!updateResult.errors) {
              console.log(`Updated document content for: ${relativePath}`);
            }
          }
        } catch (updateError) {
          console.warn(
            `Failed to update content for ${relativePath}:`,
            updateError
          );
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
      console.error(errorMsg, error);
    }
  }

  return results;
}

export async function POST(req: NextRequest) {
  try {
    const { apiGroupData } = await req.json();

    if (!apiGroupData) {
      return NextResponse.json(
        { error: "API group data is required" },
        { status: 400 }
      );
    }

    let groupData: GroupApiData;

    try {
      groupData =
        typeof apiGroupData === "string"
          ? JSON.parse(apiGroupData)
          : apiGroupData;
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid API group data format" },
        { status: 400 }
      );
    }

    if (!groupData.endpoints || groupData.endpoints.length === 0) {
      return NextResponse.json(
        { error: "No endpoints provided" },
        { status: 400 }
      );
    }

    const results = await createDocsViaTina(groupData, req);

    if (results.success) {
      return NextResponse.json({
        success: true,
        message: `Successfully created ${results.createdFiles.length} MDX files via TinaCMS`,
        files: results.createdFiles,
        method: "TinaCMS GraphQL mutations",
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: `Partially successful: created ${results.createdFiles.length} files, ${results.errors.length} errors`,
          files: results.createdFiles,
          errors: results.errors,
          method: "TinaCMS GraphQL mutations",
        },
        { status: 207 }
      );
    }
  } catch (error) {
    console.error("Error creating API docs via TinaCMS:", error);
    return NextResponse.json(
      {
        error: "Failed to create API documentation files via TinaCMS",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
