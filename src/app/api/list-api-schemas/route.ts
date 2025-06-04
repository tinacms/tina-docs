import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const schemaDir = path.join(process.cwd(), "content/apiSchema");

    // Check if directory exists
    if (!fs.existsSync(schemaDir)) {
      return NextResponse.json({ schemas: [] });
    }

    // Read all JSON files in the directory
    const files = fs
      .readdirSync(schemaDir)
      .filter((file) => file.endsWith(".json"));

    const schemas = files.map((file) => ({
      id: file,
      filename: file,
      relativePath: file,
      displayName: file.replace(".json", ""),
    }));

    return NextResponse.json({ schemas });
  } catch (error) {
    console.error("Error reading API schemas:", error);
    return NextResponse.json(
      { error: "Failed to read API schemas" },
      { status: 500 }
    );
  }
}
