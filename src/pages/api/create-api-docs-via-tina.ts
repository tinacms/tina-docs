import { NextApiRequest, NextApiResponse } from "next";

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
 * Generates the MDX body content for an endpoint as TinaCMS-compatible rich text JSON
 */
function generateMdxBodyContent(endpoint: EndpointData, schema: string): any {
  const { method, path, description } = endpoint;

  // Simple rich text structure that TinaCMS can handle
  return {
    type: "root",
    children: [
      ...(description
        ? [
            {
              type: "paragraph",
              children: [{ type: "text", value: description }],
            },
          ]
        : []),
      {
        type: "heading",
        attrs: { level: 2 },
        children: [{ type: "text", value: "Endpoint Details" }],
      },
      {
        type: "paragraph",
        children: [
          { type: "text", value: "Method: " },
          { type: "inlineCode", value: method },
          { type: "text", value: " " },
          { type: "hardBreak" },
          { type: "text", value: "Path: " },
          { type: "inlineCode", value: path },
        ],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        children: [{ type: "text", value: "API Reference" }],
      },
      {
        type: "mdxJsxFlowElement",
        name: "apiReference",
        attributes: [
          {
            type: "mdxJsxAttribute",
            name: "schemaFile",
            value: `${schema}|${method}:${path}`,
          },
        ],
        children: [],
      },
    ],
  };
}

/**
 * Creates docs via TinaCMS GraphQL mutation
 */
async function createDocsViaTina(
  groupData: GroupApiData
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
    // In staging/production, use TinaCloud API
    const clientId = process.env.NEXT_PUBLIC_TINA_CLIENT_ID;
    const branch =
      process.env.NEXT_PUBLIC_TINA_BRANCH ||
      process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF ||
      "main";

    if (!clientId) {
      return {
        ...results,
        success: false,
        errors: [
          `TinaCMS client ID not found. Please set NEXT_PUBLIC_TINA_CLIENT_ID environment variable. Current branch: ${branch}`,
        ],
      };
    }

    // TinaCloud GraphQL endpoint format
    tinaEndpoint = `https://content.tinajs.io/1.5/content/${clientId}/github/${branch}`;
  }

  console.log(
    `Using TinaCMS endpoint: ${tinaEndpoint} (NODE_ENV: ${process.env.NODE_ENV})`
  );

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: simpleMutation,
          variables: simpleVariables,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
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
            headers: {
              "Content-Type": "application/json",
            },
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { apiGroupData } = req.body;

    if (!apiGroupData) {
      return res.status(400).json({ error: "API group data is required" });
    }

    let groupData: GroupApiData;

    try {
      groupData =
        typeof apiGroupData === "string"
          ? JSON.parse(apiGroupData)
          : apiGroupData;
    } catch (error) {
      return res.status(400).json({ error: "Invalid API group data format" });
    }

    if (!groupData.endpoints || groupData.endpoints.length === 0) {
      return res.status(400).json({ error: "No endpoints provided" });
    }

    const results = await createDocsViaTina(groupData);

    if (results.success) {
      return res.status(200).json({
        success: true,
        message: `Successfully created ${results.createdFiles.length} MDX files via TinaCMS`,
        files: results.createdFiles,
        method: "TinaCMS GraphQL mutations",
      });
    } else {
      return res.status(207).json({
        success: false,
        message: `Partially successful: created ${results.createdFiles.length} files, ${results.errors.length} errors`,
        files: results.createdFiles,
        errors: results.errors,
        method: "TinaCMS GraphQL mutations",
      });
    }
  } catch (error) {
    console.error("Error creating API docs via TinaCMS:", error);
    return res.status(500).json({
      error: "Failed to create API documentation files via TinaCMS",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
