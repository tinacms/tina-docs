/**
 * Utilities for formatting and generating IDs for document elements
 */

/**
 * Generates a URL-friendly ID from a document header or label text
 * Used for anchor links and table of contents navigation
 *
 * @param label - The header text to convert to an ID
 * @returns A URL-friendly string for use as an HTML ID attribute
 */
export const formatHeaderId = (label?: string): string | undefined => {
  if (!label) {
    return undefined;
  }

  return label
    .toLowerCase()
    .replace(/^\s*"|"\s*$/g, "-") // Replace quotes at start/end with hyphens
    .replace(/^-*|-*$/g, "") // Remove leading/trailing hyphens
    .replace(/\s+/g, "-") // Replace whitespace with hyphens
    .replace(/[^a-z0-9\\-]/g, ""); // Remove any characters other than lowercase alphanumeric and hyphens
};
