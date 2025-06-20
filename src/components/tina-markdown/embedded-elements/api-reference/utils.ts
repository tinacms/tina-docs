export const resolveReference = (ref: string, definitions: any): any => {
  if (!ref || typeof ref !== "string" || !ref.startsWith("#/")) {
    return null;
  }

  // Extract the path from the reference
  const path = ref.substring(2).split("/");

  // Navigate through the definitions object
  let result = definitions;
  for (const segment of path) {
    if (!result || !result[segment]) {
      return null;
    }
    result = result[segment];
  }

  return result;
};

export const generateExample = (
  schema: any,
  definitions: any,
  depth = 0
): any => {
  if (depth > 3) return "...";
  if (schema.$ref) {
    const refSchema = resolveReference(schema.$ref, definitions);
    if (refSchema) {
      return generateExample(refSchema, definitions, depth);
    }
    return `<${schema.$ref.split("/").pop()}>`;
  }
  switch (schema.type) {
    case "string":
      return schema.example || schema.default || "string";
    case "integer":
    case "number":
      return schema.example || schema.default || 0;
    case "boolean":
      return schema.example || schema.default || false;
    case "array":
      if (schema.items) {
        const itemExample = generateExample(
          schema.items,
          definitions,
          depth + 1
        );
        return [itemExample];
      }
      return [];
    case "object":
      if (schema.properties) {
        const obj: any = {};
        for (const [key, prop] of Object.entries(schema.properties)) {
          obj[key] = generateExample(prop, definitions, depth + 1);
        }
        return obj;
      }
      return {};
    default:
      if (schema.properties) {
        const obj: any = {};
        for (const [key, prop] of Object.entries(schema.properties)) {
          obj[key] = generateExample(prop, definitions, depth + 1);
        }
        return obj;
      }
      return null;
  }
};
