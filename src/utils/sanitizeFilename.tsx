/**
 * Sanitizes a string to be used as a directory/file name
 */
export const sanitizeFileName = (name: string): string => {
  return name
    .replace(/[^\w\s-]/g, "") // Remove special characters except spaces and dashes
    .replace(/\s+/g, "-") // Replace spaces with dashes
    .toLowerCase();
};
