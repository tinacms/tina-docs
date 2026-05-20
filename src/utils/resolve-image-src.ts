const TINA_CLOUD_ASSET_REGEX = /^https?:\/\/assets\.tina\.io\/[^/]+\/(.+)$/;

/** Extract local path from TinaCloud CDN URLs, or return the path as-is. */
export function normalizeTinaCloudSrc(src: string): string {
  const match = src.match(TINA_CLOUD_ASSET_REGEX);
  if (match) {
    return `/${match[1]}`;
  }
  return src;
}

/** Prepend NEXT_PUBLIC_BASE_PATH for local image paths; pass through external URLs. */
export function resolveImageSrc(src: string): string {
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
