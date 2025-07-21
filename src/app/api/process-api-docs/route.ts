import { TinaGraphQLClient } from "@/src/utils/tina/tina-graphql-client";
import { type NextRequest, NextResponse } from "next/server";
import { generateMdxFiles } from "./generate-mdx-files";
import type { GroupApiData } from "./types";

const isDev = process.env.NODE_ENV === "development";

export async function POST(request: NextRequest) {
  try {
    const { data } = await request.json();
    const authHeader = request.headers.get("authorization");

    if (!isDev && (!authHeader || !authHeader.startsWith("Bearer "))) {
      return NextResponse.json(
        { error: "Missing Authorization token" },
        { status: 401 }
      );
    }

    const token = authHeader?.replace("Bearer ", "");
    const client = new TinaGraphQLClient(token || "");

    const tabs = data?.tabs || [];

    if (!Array.isArray(tabs)) {
      return NextResponse.json(
        { error: "Invalid data format - expected tabs array" },
        { status: 400 }
      );
    }

    const allCreatedFiles: string[] = [];
    const allSkippedFiles: string[] = [];
    for (const item of tabs) {
      if (item._template === "apiTab") {
        // Process API groups within this tab
        for (const group of item.supermenuGroup || []) {
          if (group._template === "groupOfApiReferences" && group.apiGroup) {
            try {
              // Parse the group data
              const groupData: GroupApiData =
                typeof group.apiGroup === "string"
                  ? JSON.parse(group.apiGroup)
                  : group.apiGroup;

              // Generate files for this group
              const { createdFiles, skippedFiles } = await generateMdxFiles(
                groupData,
                client
              );
              allCreatedFiles.push(...createdFiles);
              allSkippedFiles.push(...skippedFiles);
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
      skippedFiles: allSkippedFiles,
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
