import path from "path";
import { mkdir, writeFile } from "fs/promises";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { content, filename } = await req.json();

  // ✅ Use /tmp instead of /public
  const dir = path.join("/tmp", "exports");
  const filePath = path.join(dir, filename);

  // Ensure all parent directories exist
  await mkdir(path.dirname(filePath), { recursive: true });

  await writeFile(filePath, content, "utf8");
  return NextResponse.json({ url: `/api/exports/${filename}` });
}
