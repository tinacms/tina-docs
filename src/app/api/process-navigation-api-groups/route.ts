import { type NextRequest, NextResponse } from "next/server";
import { generateApiDocsFiles } from "./generate-api-docs-files";
import type { GroupApiData } from "./types";

export async function POST(request: NextRequest) {
  try {
    const { data } = await request.json();

    const tabs = data?.tabs || [];

    if (!Array.isArray(tabs)) {
      return NextResponse.json(
        { error: "Invalid data format - expected tabs array" },
        { status: 400 }
      );
    }

    const allCreatedFiles: string[] = [];

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
      message: `Processed ${tabs.length} navigation tabs`,
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
