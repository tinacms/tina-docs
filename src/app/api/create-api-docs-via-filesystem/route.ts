import * as fs from "node:fs";
import * as path from "node:path";
import {
  ADD_PENDING_DOCUMENT_MUTATION,
  UPDATE_DOCS_MUTATION,
} from "@/src/constants";
import { getTinaEndpoint } from "@/src/utils/get-tina-endpoint";
import { insertContent } from "@/tina/customFields/group-of-api-reference-selector/tina-client-side";
import { type NextRequest, NextResponse } from "next/server";

export interface EndpointData {
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

const createAPIReferenceMDXFilesInGraphQL = async (
  collection: string,
  relativePath: string
) => {
  const tinaEndpoint = getTinaEndpoint();

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
};

const updateAPIReferenceMDXFilesInGraphQL = async (
  relativePath: string,
  endpoint: any,
  schema: string
) => {
  const tinaEndpoint = getTinaEndpoint();

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

    const body = await insertContent(
      relativePath,
      title,
      description,
      endpoint,
      schema
    );

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.TINA_TOKEN}`,
    };

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
};

/**
 * Generates .mdx files for each endpoint in the provided API group data
 */
async function generateApiEndpointFiles(
  groupData: GroupApiData,
  baseDir = "content/docs/api-documentation"
): Promise<string[]> {
  if (!groupData.endpoints || groupData.endpoints.length === 0) {
    return [];
  }

  const createdFiles: string[] = [];
  const { schema, tag, endpoints } = groupData;

  // Create a directory for this tag if it doesn't exist
  const tagDir = path.join(process.cwd(), baseDir, sanitizeFileName(tag));
  if (!fs.existsSync(tagDir)) {
    fs.mkdirSync(tagDir, { recursive: true });
  }

  const results = {
    success: true,
    createdFiles: [] as string[],
    errors: [] as string[],
  };

  for (const endpoint of endpoints) {
    const fileName = generateFileName(endpoint);
    const relativePath = path.join(tagDir, `${fileName}.mdx`);

    try {
      const result = await createAPIReferenceMDXFilesInGraphQL(
        "docs",
        relativePath
      );

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
  // Only allow in development environment for security
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      {
        error: "File generation is only available in development environment",
        suggestion: "Use TinaCMS GraphQL API for file generation in production",
      },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { apiGroupData } = body;

    if (!apiGroupData) {
      return NextResponse.json(
        { error: "API group data is required" },
        { status: 400 }
      );
    }

    // Parse the group data if it's a string
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

    const { schema, tag, endpoints } = groupData;

    if (!schema || !tag || !endpoints || endpoints.length === 0) {
      return NextResponse.json(
        { error: "Schema, tag, and endpoints are required" },
        { status: 400 }
      );
    }

    // Generate files using the helper function
    const createdFiles = await generateApiEndpointFiles(groupData);

    return NextResponse.json({
      success: true,
      files: createdFiles,
      message: `Generated ${createdFiles.length} MDX files`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to generate API docs",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
