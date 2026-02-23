/**
 * Build-time image dimension injection for TinaCMS body AST.
 *
 * Walks the rich-text AST produced by TinaCMS, finds `img` nodes whose
 * `url` points to a local file in `public/`, reads the file to extract
 * width and height, and attaches those properties to the node so the
 * client-side `ImageComponent` can render with explicit dimensions
 * (preventing CLS) without any runtime dimension detection.
 */

import fs from "node:fs";
import path from "node:path";
import { imageSize } from "image-size";

interface AstNode {
  type?: string;
  url?: string;
  width?: number;
  height?: number;
  children?: AstNode[];
  [key: string]: unknown;
}

/**
 * Resolve an image URL to an absolute file path under `public/`.
 * Handles both local paths (/img/foo.png) and TinaCloud CDN URLs
 * (https://assets.tina.io/{project-id}/img/foo.png) by extracting
 * the path portion and looking it up locally.
 * Returns `null` for data URIs or unresolvable URLs.
 *
 * NOTE on TinaCloud URL coupling:
 * TinaCMS treats inline rich-text images (from markdown `![]()`) differently
 * from object-type images (e.g. accordion/showcase `image` fields).
 * In production, inline images are served via TinaCloud CDN URLs like
 * `https://assets.tina.io/{project-id}/img/foo.png`, even though the same
 * file exists locally in `public/img/foo.png`. Object-type images retain
 * their local paths (e.g. `/img/foo.png`).
 *
 * This means we need to extract the path from TinaCloud URLs to look up
 * dimensions locally. If TinaCloud changes their URL structure, this regex
 * will need updating. See: https://tina.io/docs/reference/media/overview/
 */
function resolveImagePath(url: string): string | null {
  if (url.startsWith("data:")) {
    return null;
  }

  const publicDir = path.join(process.cwd(), "public");

  // TinaCloud CDN URLs: https://assets.tina.io/{project-id}/path/to/image.png
  // Inline rich-text images get rewritten to these URLs in production builds.
  // We extract the path after the project ID to find the file locally in public/.
  const tinaCloudMatch = url.match(
    /^https?:\/\/assets\.tina\.io\/[^/]+\/(.+)$/
  );
  if (tinaCloudMatch) {
    return path.join(publicDir, tinaCloudMatch[1]);
  }

  // Skip other external URLs (non-TinaCloud)
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return null;
  }

  // Local path (used during local dev and for object-type image fields)
  return path.join(publicDir, url);
}

/**
 * Mutates the TinaCMS body AST in place, adding `width` and `height`
 * to every `img` node whose image can be found on disk.
 */
export function augmentBodyImageDimensions(body: AstNode): void {
  if (!body) return;

  const nodes: AstNode[] = Array.isArray(body.children)
    ? body.children
    : Array.isArray(body)
      ? (body as unknown as AstNode[])
      : [];

  for (const node of nodes) {
    if (node.type === "img" && node.url && !node.width) {
      const filePath = resolveImagePath(node.url);
      if (filePath && fs.existsSync(filePath)) {
        try {
          const buffer = fs.readFileSync(filePath);
          const dims = imageSize(new Uint8Array(buffer));
          if (dims.width && dims.height) {
            node.width = dims.width;
            node.height = dims.height;
          }
        } catch {
          // Skip images that can't be read
        }
      }
    }

    // Recurse into children
    if (Array.isArray(node.children) && node.children.length > 0) {
      augmentBodyImageDimensions(node as AstNode);
    }
  }
}
