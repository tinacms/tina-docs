import type { Endpoint, ExpandedResponsesState } from "./types";

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

export const extractEndpoints = (schemaJson: any) => {
  const endpoints: Endpoint[] = [];
  if (schemaJson.paths) {
    for (const path of Object.keys(schemaJson.paths)) {
      const pathObj = schemaJson.paths[path];
      for (const method of Object.keys(pathObj)) {
        if (method === "parameters") continue; // Skip path-level parameters

        const operation = pathObj[method];

        // Handle request body for OpenAPI 3.0 or Swagger 2.0
        let requestBody: any = undefined;
        if (operation.requestBody) {
          requestBody = operation.requestBody;
        } else if (operation.parameters?.some((p: any) => p.in === "body")) {
          requestBody = {
            content: {
              "application/json": {
                schema:
                  operation.parameters.find((p: any) => p.in === "body")
                    ?.schema || {},
              },
            },
          };
        }

        // Filter out body parameters if we have a request body
        const parameters = [
          ...(pathObj.parameters || []), // Include path-level parameters
          ...(operation.parameters || []),
        ].filter((p) => {
          // If we have a request body from a body parameter, filter out that parameter
          if (requestBody && p.in === "body") {
            return false;
          }
          return true;
        });

        endpoints.push({
          path,
          method: method.toUpperCase(),
          summary: operation.summary || `${method.toUpperCase()} ${path}`,
          description: operation.description,
          operationId: operation.operationId,
          parameters,
          responses: operation.responses,
          requestBody,
          tags: operation.tags,
          security: operation.security,
        });
      }
    }
  }
  return endpoints;
};

// Generates the initial expanded/collapsed state for endpoint responses.
// A response will be expanded by default when:
//   1. The response object contains expandable content (schema, content, etc.)
// The returned Map is keyed by `<METHOD>-<PATH>-<STATUS_CODE>` and the value
// indicates whether the response should start expanded (true) or collapsed (false).
export const generateInitialExpandedState = (
  endpoints: Endpoint[]
): ExpandedResponsesState => {
  const initialState: ExpandedResponsesState = new Map();

  for (const endpoint of endpoints) {
    if (!endpoint.responses) continue;

    for (const [code, response] of Object.entries(endpoint.responses)) {
      const key = `${endpoint.method}-${endpoint.path}-${code}`;

      // Cast response to any for property access convenience
      const resp = response as any;

      const hasExpandableContent =
        resp &&
        ((resp.content && Object.keys(resp.content).length > 0) || // OpenAPI 3.x style
          resp.schema || // Swagger 2.0 style
          (typeof resp === "object" &&
            Object.keys(resp).some((k) => k !== "description")));

      initialState.set(key, hasExpandableContent);
    }
  }

  return initialState;
};
