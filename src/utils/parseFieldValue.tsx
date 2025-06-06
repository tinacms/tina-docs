/**
 * Parses field value safely
 */
export const parseFieldValue = (value: string) => {
  try {
    return value ? JSON.parse(value) : { schema: "", tag: "", endpoints: [] };
  } catch {
    return { schema: "", tag: "", endpoints: [] };
  }
};
