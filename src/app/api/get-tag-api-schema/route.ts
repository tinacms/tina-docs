import { client } from "@/tina/__generated__/client";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("filename");

  if (!filename) {
    return NextResponse.json(
      { error: "Filename parameter is required" },
      { status: 400 }
    );
  }

  try {
    const { data } = await client.queries.apiSchema({ relativePath: filename });
    const rawSchema = data.apiSchema?.apiSchema;

    if (!rawSchema) {
      return NextResponse.json(
        { error: "Schema file not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ apiSchema: JSON.parse(rawSchema) });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in schema file" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to read API schema" },
      { status: 500 }
    );
  }
}
