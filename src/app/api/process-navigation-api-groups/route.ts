import { type NextRequest, NextResponse } from "next/server";
import { sanitizeFileName } from "../../../utils/sanitizeFilename";

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

  const tagDir = sanitizeFileName(tag);
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

  for (const endpoint of endpoints) {
    try {
      const fileName = generateFileName(endpoint);
      const filePath = path.join(outputDir, `${fileName}.mdx`);

      // Create title from summary or generate one
      const title = endpoint.summary || `${endpoint.method} ${endpoint.path}`;
      const description =
        endpoint.description ||
        `API endpoint for ${endpoint.method} ${endpoint.path}`;

      // Generate MDX content
      const mdxContent = `---
title: "${title}"
last_edited: "${new Date().toISOString()}"
seo:
  title: "${title}"
  description: "${description}"
---

# ${title}

${description || `Documentation for ${endpoint.method} ${endpoint.path}`}

**Method:** ${endpoint.method}
**Path:** ${endpoint.path}

<!-- Add your API documentation content here -->
`;

      fs.writeFileSync(filePath, mdxContent, "utf-8");
      createdFiles.push(path.relative(process.cwd(), filePath));
    } catch (error) {
      // Continue with other files if one fails
    }
  }

  return createdFiles;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data } = body;

    if (!data || !Array.isArray(data)) {
      return NextResponse.json(
        { error: "Invalid data format - expected array" },
        { status: 400 }
      );
    }

    const allCreatedFiles: string[] = [];

    // Process each navigation item
    for (const item of data) {
      if (item.__typename === "ApiTab") {
        // Process API groups within this tab
        for (const group of item.groups || []) {
          if (group.type === "groupOfApiReferences" && group.data) {
            try {
              // Parse the group data
              let groupData: GroupApiData;
              try {
                groupData =
                  typeof group.data === "string"
                    ? JSON.parse(group.data)
                    : group.data;
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
      message: `Processed ${data.length} navigation items`,
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
