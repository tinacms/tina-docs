import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Extract path segments from the URL pathname
    const url = new URL(request.url);
    const segments = url.pathname.split("/").filter(Boolean);

    // Find the index of "exports" and get the rest as path segments
    const exportIndex = segments.indexOf("exports");
    const pathSegments = segments.slice(exportIndex + 1);

    const filePath = path.join("/tmp/exports", ...pathSegments);
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
