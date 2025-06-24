import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const schemasDir = path.join(process.cwd(), "content", "apiSchema");

    if (!fs.existsSync(schemasDir)) {
      return NextResponse.json({ schemas: [] });
    }

    const files = fs.readdirSync(schemasDir);
    const schemas = files
      .filter((file) => file.endsWith(".json"))
      .map((file) => {
        const displayName = path.basename(file, ".json");
        return {
          id: displayName,
          filename: file,
          displayName,
          apiSchema: JSON.parse(
            fs.readFileSync(path.join(schemasDir, file), "utf-8")
          ).apiSchema,
        };
      });

    return NextResponse.json({ schemas });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read API schemas" },
      { status: 500 }
    );
  }
}
