export interface ImageMetadata {
  src: string;
  width?: number;
  height?: number;
  alt?: string;
}

/**
 * Resolves an image path, handling both absolute URLs and relative paths.
 * For relative paths, automatically prepends the base path if configured.
 *
 * @param src - The image source path (can be absolute URL or relative path)
 * @returns The resolved image path with base path prepended if needed
 */
export function getImagePath(src: string): string {
  if (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("data:")
  ) {
    return src;
  }
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return `${basePath}${src}`;
}

/**
 * Normalizes an image value (string path or ImageMetadata object) into
 * a consistent ImageMetadata shape.
 */
export function normalizeImage(
  image: string | ImageMetadata,
  fallbackAlt = ""
): ImageMetadata {
  if (typeof image === "string") {
    return { src: image, alt: fallbackAlt };
  }
  return image || { src: "", alt: fallbackAlt };
}
