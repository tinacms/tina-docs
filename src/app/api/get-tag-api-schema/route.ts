import fs from "node:fs";
import path from "node:path";
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
    const schemasDir = path.join(process.cwd(), "content", "apiSchema");
    const filePath = path.join(schemasDir, filename);

    // Security check: ensure the file is within the schemas directory
    const resolvedPath = path.resolve(filePath);
    const resolvedSchemasDir = path.resolve(schemasDir);

    if (!resolvedPath.startsWith(resolvedSchemasDir)) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "Schema file not found" },
        { status: 404 }
      );
    }

    const fileContent = fs.readFileSync(filePath, "utf-8");
    const parsedFile = JSON.parse(fileContent);

    // The actual API schema is stored as a string in the apiSchema property
    // We need to parse it again to get the actual OpenAPI spec
    let apiSchema: any;
    if (parsedFile.apiSchema && typeof parsedFile.apiSchema === "string") {
      apiSchema = JSON.parse(parsedFile.apiSchema);
    } else {
      apiSchema = parsedFile.apiSchema || parsedFile;
    }

    return NextResponse.json({ apiSchema });
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
