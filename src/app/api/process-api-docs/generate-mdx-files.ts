import { sanitizeFileName } from "@/src/utils/sanitizeFilename";
import { createOrUpdateAPIReference } from "@/src/utils/tina/api-reference";
import type { TinaGraphQLClient } from "@/src/utils/tina/tina-graphql-client";
import type { EndpointData } from "./types";

const collection = "docs";
/**
 * Generates a safe filename from endpoint data
 */
export function generateAPIEndpointFileName(endpoint: EndpointData): string {
  const method = endpoint.method.toLowerCase();
  const pathSafe = endpoint.path
    .replace(/^\//, "") // Remove leading slash
    .replace(/\//g, "-") // Replace slashes with dashes
    .replace(/[{}]/g, "") // Remove curly braces
    .replace(/[^\w-]/g, "") // Remove any non-word characters except dashes
    .toLowerCase();

  return `${method}-${pathSafe}`;
}

export async function generateMdxFiles(
  groupData: {
    tag: string;
    schema: string;
    endpoints: EndpointData[];
  },
  client: TinaGraphQLClient
): Promise<{ createdFiles: string[]; skippedFiles: string[] }> {
  if (!groupData.endpoints?.length)
    return { createdFiles: [], skippedFiles: [] };

  const { tag, schema, endpoints } = groupData;
  const basePath = `api-documentation/${sanitizeFileName(tag)}`;
  const createdFiles: string[] = [];
  const skippedFiles: string[] = [];
  const errors: string[] = [];

  for (const endpoint of endpoints) {
    const fileName = generateAPIEndpointFileName(endpoint);
    const relativePath = `${basePath}/${fileName}.mdx`;

    try {
      const result = await createOrUpdateAPIReference(
        client,
        relativePath,
        collection,
        endpoint,
        schema
      );

      if (result === "created" || result === "updated") {
        createdFiles.push(relativePath);
      } else if (result === "skipped") {
        skippedFiles.push(relativePath);
      }
    } catch (error: any) {
      errors.push(
        `Failed to handle ${endpoint.method} ${endpoint.path}: ${error.message}`
      );
    }
  }

  if (errors.length > 0) {
    // biome-ignore lint/suspicious/noConsole: <explanation>
    console.error("API Doc Generation Errors:\n", errors.join("\n"));
  }

  return { createdFiles, skippedFiles };
}
