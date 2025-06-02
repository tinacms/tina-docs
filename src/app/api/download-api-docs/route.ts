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

# ${title}

${description ? `${description}\n` : ""}

## Endpoint Details

**Method:** \`${method}\`  
**Path:** \`${path}\`

## API Reference

<apiReference schemaFile="${schema}|${method}:${path}" />
`;
}

/**
 * Generates files in memory and returns them as JSON
 */
function generateApiEndpointFilesInMemory(
  groupData: GroupApiData
): { filename: string; content: string; path: string }[] {
  if (!groupData.endpoints || groupData.endpoints.length === 0) {
    return [];
  }

  const files: { filename: string; content: string; path: string }[] = [];
  const { schema, tag, endpoints } = groupData;

  const tagDir = sanitizeFileName(tag);

  for (const endpoint of endpoints) {
    const fileName = generateFileName(endpoint);
    const fullFileName = `${fileName}.mdx`;
    const relativePath = `content/docs/api-documentation/${tagDir}/${fullFileName}`;

    const mdxContent = generateMdxContent(endpoint, schema);

    files.push({
      filename: fullFileName,
      content: mdxContent,
      path: relativePath,
    });
  }

  return files;
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

    const generatedFiles = generateApiEndpointFilesInMemory(groupData);

    return NextResponse.json({
      success: true,
      message: `Generated ${generatedFiles.length} MDX files`,
      files: generatedFiles,
      instructions:
        "Download these files and place them in your content/docs/api-documentation directory",
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
