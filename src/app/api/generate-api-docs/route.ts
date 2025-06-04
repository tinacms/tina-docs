import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

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
 * Generates the MDX content for an endpoint
 */
function generateMdxContent(endpoint: EndpointData, schema: string): string {
  const { method, path, summary, description } = endpoint;

  // Create a title from the summary or generate one
  const title = summary || `${method} ${path}`;

  return `---
title: "${title}"
description: "${description || `API endpoint for ${method} ${path}`}"
last_edited: "${new Date().toISOString()}"
---

${description ? `${description}\n` : ""}

## Endpoint Details

**Method:** \`${method}\`  
**Path:** \`${path}\`

## API Reference

<apiReference schemaFile="${schema}|${method}:${path}" />
`;
}

/**
 * Generates .mdx files for each endpoint in the provided API group data
 */
async function generateApiEndpointFiles(
  groupData: GroupApiData,
  baseDir: string = "content/docs/api-documentation"
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

    const mdxContent = generateMdxContent(endpoint, schema);

    try {
      fs.writeFileSync(filePath, mdxContent, "utf8");
      createdFiles.push(path.relative(process.cwd(), filePath));
      
    } catch (error) {
      console.error(`Failed to create file ${filePath}:`, error);
    }
  }

  return createdFiles;
}

export async function POST(req: NextRequest) {
  // Only allow file generation in development environment
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      {
        error: "File generation is only available in development environment",
        suggestion: "Please run this feature locally in development mode",
      },
      { status: 403 }
    );
  }

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

    const createdFiles = await generateApiEndpointFiles(groupData);

    return NextResponse.json({
      success: true,
      message: `Successfully generated ${createdFiles.length} MDX files`,
      files: createdFiles,
    });
  } catch (error) {
    console.error("Error generating API docs:", error);
    return NextResponse.json(
      {
        error: "Failed to generate API documentation files",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
} 