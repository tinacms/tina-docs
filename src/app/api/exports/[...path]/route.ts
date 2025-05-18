import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = path.join("/tmp/exports", ...params.path);
    const content = await readFile(filePath, "utf-8");

    // Set appropriate headers for markdown files
    const headers = new Headers();
    headers.set("Content-Type", "text/markdown");

    return new NextResponse(content, {
      headers,
    });
  } catch (error) {
    return new NextResponse("File not found", { status: 404 });
  }
}
