import * as fs from "node:fs";
import * as path from "node:path";
import { getApiReferenceTemplate } from "@/src/utils/docs/get-api-reference-template";
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

  for (const endpoint of endpoints) {
    const fileName = generateFileName(endpoint);
    const filePath = path.join(tagDir, `${fileName}.mdx`);

    const mdxContent = getApiReferenceTemplate(endpoint, schema);

    try {
      fs.writeFileSync(filePath, mdxContent as string, "utf8");
      createdFiles.push(path.relative(process.cwd(), filePath));
    } catch (error) {
      // Continue with other files if one fails
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
