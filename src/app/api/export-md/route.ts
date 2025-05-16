import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  const { content, filename } = await req.json();

  // ✅ Use /tmp instead of /public
  const dir = path.join("/tmp", "exports");
  const filePath = path.join(dir, filename);

  // Ensure the directory exists
  await mkdir(dir, { recursive: true });

  await writeFile(filePath, content, "utf8");
  return NextResponse.json({ url: `/exports/${filename}` });
}
