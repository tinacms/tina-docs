/**
 * Resolves an image path, handling both absolute URLs and relative paths.
 * For relative paths, automatically prepends the base path if configured.
 *
 * @param src - The image source path (can be absolute URL or relative path)
 * @returns The resolved image path with base path prepended if needed
 */
export function getImagePath(src: string): string {
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return `${basePath}${src}`;
}
