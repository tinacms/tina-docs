import { readFile } from "node:fs/promises";
import path from "node:path";
import { type NextRequest, NextResponse } from "next/server";

const isDev = process.env.NODE_ENV === "development";
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Extract path segments from the URL pathname
    const url = new URL(request.url);
    const segments = url.pathname.split("/").filter(Boolean);

    const exportIndex = segments.indexOf("exports");
    const pathSegments = segments.slice(exportIndex + 1);

    const filePath = path.join(
      isDev ? "public" : "/tmp",
      "exports",
      ...pathSegments
    );

    const content = await readFile(filePath, "utf-8");

    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/markdown",
      },
    });
  } catch (error) {
    return new NextResponse("File not found", { status: 404 });
  }
}
