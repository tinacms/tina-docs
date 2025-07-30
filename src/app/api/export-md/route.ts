import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { type NextRequest, NextResponse } from "next/server";

const isDev = process.env.NODE_ENV === "development";

export async function POST(req: NextRequest) {
  const { content, filename } = await req.json();

  // Use /tmp instead of /public for vercel
  const dir = path.join(isDev ? "public" : "/tmp", "exports");
  const filePath = path.join(dir, filename);

  // Ensure all parent directories exist
  await mkdir(path.dirname(filePath), { recursive: true });

  await writeFile(filePath, content, "utf8");
  return NextResponse.json({ url: `/api/exports/${filename}` });
}
