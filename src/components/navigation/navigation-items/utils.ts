import { matchActualTarget } from "@/utils/docs/urls";
import { getUrl } from "@/utils/get-url";
import type { ApiEndpoint, ApiGroupData } from "./types";

export const getEndpointSlug = (method: string, path: string) => {
  // Match the exact filename generation logic from our API endpoint generator
  const pathSafe = path
    .replace(/^\//, "") // Remove leading slash
    .replace(/\//g, "-") // Replace slashes with dashes
    .replace(/[{}]/g, "") // Remove curly braces
    .replace(/[^\w-]/g, "") // Remove any non-word characters except dashes
    .toLowerCase();

  return `${method.toLowerCase()}-${pathSafe}`;
};

export const getTagSlug = (tag: string) => {
  // Match the exact tag sanitization logic from our API endpoint generator
  return tag
    .replace(/[^\w\s-]/g, "") // Remove special characters except spaces and dashes
    .replace(/\s+/g, "-") // Replace spaces with dashes
    .toLowerCase();
};

export const hasNestedSlug = (navItems: any[], slug: string) => {
  for (const item of Array.isArray(navItems) ? navItems : []) {
    if (matchActualTarget(getUrl(item.slug || item.href), slug)) {
      return true;
    }
    if (item.items) {
      if (hasNestedSlug(item.items, slug)) {
        return true;
      }
    }
  }
  return false;
};

export const hasMatchingApiEndpoint = (items: any[], path: string) => {
  return items?.some((item: any) => {
    if (!item.apiGroup) return false;

    try {
      const apiGroupData: ApiGroupData = JSON.parse(item.apiGroup);
      const { tag, endpoints } = apiGroupData;

      if (!tag || !endpoints) return false;

      return endpoints.some((endpoint: any) => {
        const method =
          endpoint.method ||
          (typeof endpoint === "string" ? endpoint.split(":")[0] : "GET");
        const endpointPath =
          endpoint.path ||
          (typeof endpoint === "string" ? endpoint.split(":")[1] : "");
        return (
          path ===
          `/docs/api-documentation/${getTagSlug(tag)}/${getEndpointSlug(
            method,
            endpointPath
          )}`
        );
      });
    } catch (error) {
      return false;
    }
  });
};

export const processApiGroups = (
  navItems: any[]
): { normalDocs: any[]; apiGroups: Record<string, ApiEndpoint[]> } => {
  if (!navItems?.length) return { normalDocs: [], apiGroups: {} };

  const normalDocs: any[] = [];
  const apiGroups: Record<string, ApiEndpoint[]> = {};

  for (const item of navItems) {
    if (item.apiGroup) {
      try {
        const apiGroupData: ApiGroupData = JSON.parse(item.apiGroup);
        const { tag, endpoints } = apiGroupData;

        if (tag && endpoints) {
          if (!apiGroups[tag]) {
            apiGroups[tag] = [];
          }

          if (Array.isArray(endpoints) && endpoints.length > 0) {
            if (typeof endpoints[0] === "object" && "method" in endpoints[0]) {
              // New format: array of objects
              apiGroups[tag].push(
                ...(endpoints as ApiEndpoint[]).map((endpoint) => ({
                  method: endpoint.method || "GET",
                  path: endpoint.path || "",
                  summary: endpoint.summary || "",
                  operationId: endpoint.operationId,
                  schema: apiGroupData.schema || "",
                }))
              );
            } else {
              // Legacy format: array of strings
              apiGroups[tag].push(
                ...(endpoints as string[]).map((endpointId) => {
                  const [method, path] = endpointId.split(":");
                  return {
                    method: method || "GET",
                    path: path || "",
                    summary: `${method} ${path}`,
                    operationId: endpointId,
                    schema: apiGroupData.schema || "",
                  };
                })
              );
            }
          }
        }
      } catch (error) {
        // Continue processing other items
      }
    } else {
      normalDocs.push(item);
    }
  }

  return { normalDocs, apiGroups };
};
