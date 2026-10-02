import { readFile } from "node:fs/promises";
import path from "node:path";
import glob from "fast-glob";

export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  const files = await glob("content/docs/**/*.mdx");

  return files.map((file) => ({
    slug: file
      .replace(/^content\/docs\//, "")
      .replace(/\.mdx$/, "")
      .split("/"),
  }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const docsDirectory = path.join(process.cwd(), "content", "docs");
  const filePath = path.join(docsDirectory, `${slug.join(path.sep)}.mdx`);

  if (!filePath.startsWith(`${docsDirectory}${path.sep}`)) {
    return new Response(null, { status: 404 });
  }

  try {
    return new Response(await readFile(filePath, "utf8"), {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
