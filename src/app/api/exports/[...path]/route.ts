import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
): Promise<NextResponse> {
  try {
    const filePath = path.join("/tmp/exports", ...params.path);
    console.log("🚀 ~ filePath:", filePath);

    const content = await readFile(filePath, "utf-8");

    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/markdown",
      },
    });
  } catch (error) {
    console.error("File read error:", error);
    return new NextResponse("File not found", { status: 404 });
  }
}
