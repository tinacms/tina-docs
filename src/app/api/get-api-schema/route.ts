import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filename = searchParams.get("filename");

  if (!filename) {
    return NextResponse.json(
      { error: "Filename is required" },
      { status: 400 }
    );
  }

  try {
    const schemaPath = path.join(process.cwd(), "content/apiSchema", filename);

    // Security check - ensure file is in the correct directory
    if (!schemaPath.startsWith(path.join(process.cwd(), "content/apiSchema"))) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    // Check if file exists
    if (!fs.existsSync(schemaPath)) {
      return NextResponse.json(
        { error: "Schema file not found" },
        { status: 404 }
      );
    }

    // Read and parse the JSON file
    const fileContent = fs.readFileSync(schemaPath, "utf8");
    const parsedFile = JSON.parse(fileContent);

    // The actual API schema is stored as a string in the apiSchema property
    // We need to parse it again to get the actual OpenAPI spec
    let apiSchema;
    if (parsedFile.apiSchema && typeof parsedFile.apiSchema === "string") {
      apiSchema = JSON.parse(parsedFile.apiSchema);
    } else {
      // If it's already an object, use it directly
      apiSchema = parsedFile.apiSchema || parsedFile;
    }

    return NextResponse.json({ apiSchema });
  } catch (error) {
    console.error("Error reading API schema:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON format" },
        { status: 400 }
      );
    } else {
      return NextResponse.json(
        { error: "Failed to read API schema" },
        { status: 500 }
      );
    }
  }
}
