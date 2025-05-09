/**
 * Utilities for formatting dates in document metadata
 */

/**
 * Formats a date string into a human-readable format
 *
 * @param dateString - The date string to format (ISO format or any format accepted by Date constructor)
 * @returns A formatted date string in the format "Month Day, Year"
 */
export function formatDate(dateString: string | null): string {
  if (!dateString) return "";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
