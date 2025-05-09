/**
 * Utilities for handling URLs and file paths in the documentation system
 */

/**
 * Converts a file path to a URL path
 *
 * @param filepath - The file path to convert
 * @param base - Optional base path to remove from the file path
 * @returns URL-friendly path without file extension
 */
export function fileToUrl(filepath: string, base: string | null): string {
  // Remove the base path if specified
  if (base) {
    filepath = filepath.split(`/${base}/`)[1];
  }

  // Remove file extension and convert spaces to hyphens
  const index = filepath.lastIndexOf(".");
  return filepath.replace(/ /g, "-").slice(0, index).trim();
}

// Regular expression patterns for URL processing
const everythingBeforeTheHash = /(.*)#.*$/;
const everythingBeforeTheQuery = /(.*)\?.*$/;
const everythingExceptTheTrailingSlash = /(.*)\/$/;

/**
 * Creates a function that replaces parts of a URL based on a regex pattern
 *
 * @param expr - Regular expression pattern with capture group
 * @returns Function that performs the replacement
 */
function createReplacer(expr: RegExp) {
  return (url: string): string => {
    if (!url) return url;
    return url.replace(expr, "$1");
  };
}

/**
 * Removes the hash portion from a URL
 */
export const removeHash = createReplacer(everythingBeforeTheHash);

/**
 * Removes the query string from a URL
 */
export const removeQuery = createReplacer(everythingBeforeTheQuery);

/**
 * Removes trailing slash from a URL
 */
export const removeTrailingSlash = createReplacer(
  everythingExceptTheTrailingSlash
);

/**
 * Compares whether two URLs point to the same resource
 * Ignores differences in query parameters, hash fragments, and trailing slashes
 *
 * @param url1 - First URL to compare
 * @param url2 - Second URL to compare
 * @returns True if the URLs point to the same resource
 */
export function matchActualTarget(url1: string, url2: string): boolean {
  const formattedUrl1 = removeTrailingSlash(removeQuery(removeHash(url1)));
  const formattedUrl2 = removeTrailingSlash(removeQuery(removeHash(url2)));
  return formattedUrl1 === formattedUrl2;
}
