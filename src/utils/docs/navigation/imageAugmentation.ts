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

interface AstNode {
  type?: string;
  url?: string;
  width?: number;
  height?: number;
  children?: AstNode[];
  [key: string]: unknown;
}

/**
 * Extract image dimensions from a raw file buffer.
 * Supports PNG, JPEG, GIF, and WebP.
 */
function getImageDimensionsFromBuffer(
  buffer: Buffer
): { width: number; height: number } | null {
  // PNG
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return {
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20),
    };
  }

  // JPEG
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset < buffer.length) {
      if (buffer[offset] !== 0xff) break;
      const marker = buffer[offset + 1];
      if (marker === 0xc0 || marker === 0xc2) {
        return {
          height: buffer.readUInt16BE(offset + 5),
          width: buffer.readUInt16BE(offset + 7),
        };
      }
      offset += 2 + buffer.readUInt16BE(offset + 2);
    }
  }

  // GIF
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
    return {
      width: buffer.readUInt16LE(6),
      height: buffer.readUInt16LE(8),
    };
  }

  // WebP
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46
  ) {
    // Simple WebP (VP8 )
    if (
      buffer[12] === 0x56 &&
      buffer[13] === 0x50 &&
      buffer[14] === 0x38 &&
      buffer[15] === 0x20
    ) {
      return {
        width: buffer.readUInt16LE(26) & 0x3fff,
        height: buffer.readUInt16LE(28) & 0x3fff,
      };
    }
    // Lossless WebP (VP8L)
    if (
      buffer[12] === 0x56 &&
      buffer[13] === 0x50 &&
      buffer[14] === 0x38 &&
      buffer[15] === 0x4c
    ) {
      const bits = buffer.readUInt32LE(21);
      return {
        width: (bits & 0x3fff) + 1,
        height: ((bits >> 14) & 0x3fff) + 1,
      };
    }
  }

  return null;
}

/**
 * Resolve a local image URL to an absolute file path under `public/`.
 * Returns `null` for external URLs or data URIs.
 */
function resolveImagePath(url: string): string | null {
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:")
  ) {
    return null;
  }
  const publicDir = path.join(process.cwd(), "public");
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
          const dims = getImageDimensionsFromBuffer(buffer);
          if (dims) {
            node.width = dims.width;
            node.height = dims.height;
            console.log(
              `[imageAugmentation] ${node.url} → ${dims.width}x${dims.height}`
            );
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
