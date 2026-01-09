import { client } from "@/tina/__generated__/client";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const relativePath = searchParams.get("relativePath");

  if (!relativePath) {
    return NextResponse.json(
      { error: "relativePath parameter is required" },
      { status: 400 }
    );
  }

  try {
    const result = await client.queries.apiSchema({
      relativePath: relativePath,
    });

    // Parse the schema JSON
    const schemaJson = JSON.parse(result.data.apiSchema.apiSchema);

    return NextResponse.json({ schema: schemaJson });
  } catch (error) {
    console.error("Error fetching API schema:", error);
    return NextResponse.json(
      { error: "Failed to fetch API schema" },
      { status: 500 }
    );
  }
}

