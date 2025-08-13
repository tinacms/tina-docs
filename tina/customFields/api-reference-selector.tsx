"use client";

import { CustomDropdown } from "@/src/components/ui/custom-dropdown";
import { detectLocalMode } from "@/src/utils/detectLocalMode";
import { parseFieldValue } from "@/src/utils/parseFieldValue";
import React from "react";
import { wrapFieldsWithMeta } from "tinacms";

// ========================================
// API FUNCTIONS
// ========================================

/**
 * Loads schemas from the API
 */
const loadSchemas = async () => {
  const response = await fetch("/api/list-api-schemas");
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to load schemas");
  }

  return result.schemas || [];
};

/**
 * Loads tags for a specific schema
 */
const loadTagsForSchema = async (schemaFilename: string) => {
  const response = await fetch(
    `/api/get-tag-api-schema?filename=${encodeURIComponent(schemaFilename)}`
  );
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to load schema");
  }

  const apiSchema = result.apiSchema;
  if (apiSchema?.paths) {
    const tagSet = new Set<string>();

    // Extract tags
    for (const path in apiSchema.paths) {
      for (const method in apiSchema.paths[path]) {
        const op = apiSchema.paths[path][method];
        if (op.tags) {
          for (const tag of op.tags) {
            tagSet.add(tag);
          }
        }
      }
    }

    return {
      tags: Array.from(tagSet),
      apiSchema: apiSchema,
    };
  }

  return { tags: [], apiSchema: null };
};

/**
 * Validates if an API path follows the simple pattern like /something/api/{id}
 * and doesn't contain special characters
 */
const isValidApiPath = (input: string): boolean => {
  // Extract just the path if input contains an HTTP method
  const pathMatch = input.match(
    /^\s*(GET|POST|PUT|DELETE|PATCH|OPTIONS|HEAD)?\s*(\/[^\s]*)/i
  );
  if (!pathMatch) return false;

  const path = pathMatch[2]; // e.g., "/api/projects/{id}/TogglePreferredNoiseLevelMeasurement"

  // Reject special characters not allowed in paths
  const specialCharRegex = /[^a-zA-Z0-9\/\{\}\-_]/;
  if (specialCharRegex.test(path)) {
    return false;
  }

  // Allow multiple segments including path params anywhere
  const validPathRegex =
    /^\/([a-zA-Z0-9\-_]+|\{[a-zA-Z0-9\-_]+\})(\/([a-zA-Z0-9\-_]+|\{[a-zA-Z0-9\-_]+\}))*$/;

  return validPathRegex.test(path);
};

/**
 * Loads endpoints for a specific tag from API schema
 */
const loadEndpointsForTag = (
  apiSchema: any,
  tag: string,
  setIsValidPath: (isValid: boolean) => void,
  hasTags = true
) => {
  const endpointsList: {
    id: string;
    label: string;
    method: string;
    path: string;
    summary: string;
    description: string;
  }[] = [];

  for (const path in apiSchema.paths) {
    if (!isValidApiPath(path)) {
      setIsValidPath(false);
    }

    for (const method in apiSchema.paths[path]) {
      const op = apiSchema.paths[path][method];
      const endpoint = {
        id: `${method.toUpperCase()}:${path}`,
        label: `${method.toUpperCase()} ${path} - ${op.summary || ""}`,
        method: method.toUpperCase(),
        path,
        summary: op.summary || "",
        description: op.description || "",
      };

      // If we don't have tags, we show all endpoints
      if (!hasTags) {
        endpointsList.push(endpoint);
      } else if (hasTags && op.tags?.includes(tag)) {
        endpointsList.push(endpoint);
      }
    }
  }

  return endpointsList;
};

// ========================================
// MAIN COMPONENT
// ========================================

export const ApiReferencesSelector = wrapFieldsWithMeta((props: any) => {
  const { input, meta } = props;
  const [schemas, setSchemas] = React.useState<any[]>([]);
  const [tags, setTags] = React.useState<string[]>([]);
  const [endpoints, setEndpoints] = React.useState<
    {
      id: string;
      label: string;
      method: string;
      path: string;
      summary: string;
      description: string;
    }[]
  >([]);
  const [loadingSchemas, setLoadingSchemas] = React.useState(true);
  const [loadingTags, setLoadingTags] = React.useState(false);
  const [loadingEndpoints, setLoadingEndpoints] = React.useState(false);
  const [selectedSchema, setSelectedSchema] = React.useState("");
  const [selectedTag, setSelectedTag] = React.useState("");
  const [hasTag, setHasTag] = React.useState<boolean | null>(null);
  const [generatingFiles, setGeneratingFiles] = React.useState(false);
  const [lastSavedValue, setLastSavedValue] = React.useState<string>("");
  const [initialLoad, setInitialLoad] = React.useState(true);
  const [isValidPath, setIsValidPath] = React.useState<boolean | null>(null);

  const isLocalMode = detectLocalMode();
  const parsedValue = parseFieldValue(input.value);
  const selectedEndpoints = Array.isArray(parsedValue.endpoints)
    ? parsedValue.endpoints
    : [];

  // Load schemas from filesystem API
  React.useEffect(() => {
    const loadInitialData = async () => {
      setLoadingSchemas(true);
      try {
        const schemasList = await loadSchemas();
        setSchemas(schemasList);
        setLoadingSchemas(false);

        // Set local state from parsed values
        const currentSchema = parsedValue.schema || "";
        const currentTag = parsedValue.tag || "";
        setSelectedSchema(currentSchema);
        setSelectedTag(currentTag);

        // If we have existing data, load tags and endpoints only once
        if (currentSchema && hasTag === null) {
          await loadTagsAndEndpoints(currentSchema, currentTag);
        }

        // Mark initial load as complete and set the last saved value
        setInitialLoad(false);
        setLastSavedValue(input.value || "");
      } catch (error) {
        setSchemas([]);
        setLoadingSchemas(false);
        setInitialLoad(false);
        setLastSavedValue(input.value || "");
      }
    };

    loadInitialData();
  }, [parsedValue.schema, parsedValue.tag, input.value, hasTag]);

  const loadTagsAndEndpoints = async (
    schemaFilename: string,
    currentTag?: string
  ) => {
    setLoadingTags(true);
    setIsValidPath(null);
    try {
      const { tags: tagsList, apiSchema } =
        await loadTagsForSchema(schemaFilename);
      setTags(tagsList);
      setHasTag(tagsList.length > 0);
      setLoadingTags(false);

      // If we also have a selected tag, load endpoints
      if (apiSchema) {
        setLoadingEndpoints(true);

        const tag = currentTag ?? "";
        const hasTag = !!currentTag;

        const endpointsList = loadEndpointsForTag(
          apiSchema,
          tag,
          setIsValidPath,
          hasTag
        );
        setEndpoints(endpointsList);
        setLoadingEndpoints(false);
      }
    } catch (error) {
      setTags([]);
      setLoadingTags(false);
    }
  };

  // Handle schema change
  const handleSchemaChange = async (schema: string) => {
    // Only update if schema actually changed to reduce form disruption
    if (schema === selectedSchema) return;

    setSelectedSchema(schema);
    setSelectedTag("");
    setIsValidPath(null);
    setTags([]);
    setEndpoints([]);

    // Update form state with a slight delay to avoid dropdown disruption
    setTimeout(() => {
      input.onChange(JSON.stringify({ schema, tag: "", endpoints: [] }));
    }, 0);

    if (!schema) {
      setLoadingTags(false);
      return;
    }

    await loadTagsAndEndpoints(schema);
  };

  // Handle tag change
  const handleTagChange = async (tag: string) => {
    // Only update if tag actually changed
    if (tag === selectedTag) return;

    setSelectedTag(tag);
    setEndpoints([]);

    // Update form state with a slight delay to avoid dropdown disruption
    setTimeout(() => {
      input.onChange(
        JSON.stringify({ schema: selectedSchema, tag, endpoints: [] })
      );
    }, 0);

    if (!tag || !selectedSchema) {
      setLoadingEndpoints(false);
      return;
    }

    try {
      const { apiSchema } = await loadTagsForSchema(selectedSchema);
      if (apiSchema) {
        setLoadingEndpoints(true);
        const endpointsList = loadEndpointsForTag(
          apiSchema,
          tag,
          setIsValidPath
        );
        setEndpoints(endpointsList);
        setLoadingEndpoints(false);
      }
    } catch (error) {
      setEndpoints([]);
      setLoadingEndpoints(false);
    }
  };

  const handleEndpointCheckbox = (id: string) => {
    let updated: typeof endpoints;
    const clickedEndpoint = endpoints.find((ep) => ep.id === id);
    if (!clickedEndpoint) return;

    if (selectedEndpoints.find((ep) => ep.id === id)) {
      updated = selectedEndpoints.filter((ep) => ep.id !== id);
    } else {
      updated = [...selectedEndpoints, clickedEndpoint];
    }
    input.onChange(
      JSON.stringify({
        schema: selectedSchema,
        tag: selectedTag,
        endpoints: updated,
      })
    );
  };

  const handleSelectAll = () => {
    input.onChange(
      JSON.stringify({
        schema: selectedSchema,
        tag: selectedTag,
        endpoints: endpoints,
      })
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-7 my-5 max-w-xl w-full border border-gray-200 font-sans">
      <div className="mb-6">
        <label className="font-bold text-slate-800 text-base mb-2 block">
          API Schema
        </label>
        <CustomDropdown
          options={schemas.map((schema) => ({
            value: schema.filename,
            label: schema.displayName,
          }))}
          value={selectedSchema}
          onChange={handleSchemaChange}
          disabled={loadingSchemas}
          placeholder={
            loadingSchemas
              ? "Loading schemas..."
              : schemas.length === 0
                ? "No schemas available"
                : "Select a schema"
          }
          className="w-full px-4 py-2 rounded-lg border border-slate-300 text-base bg-slate-50 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        {!loadingSchemas && schemas.length === 0 && (
          <div className="text-red-600 text-sm mt-1">
            ⚠️ No API schemas found. This might be due to:
            <br />• Missing TinaCMS client generation on staging
            <br />• Missing schema files deployment
            <br />• Environment configuration issues
            <br />
            <br />
            Please ensure schema files are uploaded to the "API Schema"
            collection.
          </div>
        )}
      </div>
      {selectedSchema && (
        <div className="mb-6">
          {hasTag || hasTag === null ? (
            <>
              <label className="font-bold text-slate-800 text-base mb-2 block">
                Group/Tag
              </label>
              <CustomDropdown
                options={tags.map((tag) => ({
                  value: tag,
                  label: tag,
                }))}
                value={selectedTag}
                onChange={handleTagChange}
                disabled={loadingTags}
                placeholder={loadingTags ? "Loading tags..." : "Select a tag"}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 text-base bg-slate-50 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </>
          ) : (
            <div className="text-red-600 text-sm mt-1 border border-red-300 p-2 rounded-md">
              ⚠️ No tags found for this schema.
            </div>
          )}
        </div>
      )}
      {(selectedTag || hasTag === false) && (
        <div>
          <div className="flex items-center mb-3">
            <label className="font-bold text-slate-800 text-base mr-4">
              Endpoints
            </label>
            <button
              type="button"
              onClick={handleSelectAll}
              disabled={loadingEndpoints || isValidPath === false}
              className={`ml-auto px-4 py-1.5 rounded-md bg-blue-600 text-white font-semibold text-sm shadow hover:bg-blue-700 transition-colors border border-blue-700 disabled:opacity-50 ${
                isValidPath === false ? "cursor-not-allowed" : ""
              }`}
            >
              Select All
            </button>
          </div>
          {!loadingEndpoints && isValidPath === false && (
            <div className="text-red-600 text-sm mb-4 p-2 bg-red-50 border border-red-200 rounded-md text-wrap">
              Unsupported Schema format detected. Please check the README for
              supported endpoint configurations{" "}
              <a
                href="https://github.com/tinacms/tina-docs/tree/main?tab=readme-ov-file#api-documentation"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Read more
              </a>
              .
            </div>
          )}
          {loadingEndpoints ? (
            <div className="text-slate-400 text-sm mb-4">
              Loading endpoints...
            </div>
          ) : (
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto overflow-x-auto border border-gray-200 rounded-lg bg-slate-50 p-4 mb-4 ${
                isValidPath === false ? "opacity-50 cursor-not-allowed " : ""
              }`}
            >
              {endpoints.map((ep) => (
                <label
                  key={ep.id}
                  className={`flex items-center rounded-md px-2 py-2 cursor-pointer transition-colors border ${
                    selectedEndpoints.some((selected) => selected.id === ep.id)
                      ? "bg-indigo-50 border-indigo-400 shadow"
                      : "bg-white border-gray-200"
                  } hover:bg-indigo-100 ${
                    isValidPath === false ? "cursor-not-allowed" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedEndpoints.some(
                      (selected) => selected.id === ep.id
                    )}
                    onChange={() => handleEndpointCheckbox(ep.id)}
                    className={`accent-indigo-600 mr-3 ${
                      isValidPath === false
                        ? "cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                    disabled={isValidPath === false}
                  />
                  <span
                    className={`text-slate-700 text-sm font-medium truncate ${
                      isValidPath === false ? "cursor-not-allowed" : ""
                    }`}
                    style={{ maxWidth: "14rem", display: "inline-block" }}
                    title={ep.label}
                  >
                    {ep.label}
                  </span>
                </label>
              ))}
              {endpoints.length === 0 && (
                <div className="text-slate-400 text-sm col-span-2">
                  No endpoints found for this tag.
                </div>
              )}
            </div>
          )}

          {/* Form Save Generation Status */}
          {selectedEndpoints.length > 0 && (
            <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
              {generatingFiles ? (
                <div className="flex items-center text-green-700">
                  <span className="inline-block mr-2 animate-spin">⏳</span>
                  <span className="text-sm font-medium">
                    {isLocalMode
                      ? "Generating MDX files locally..."
                      : "Creating files via TinaCMS..."}
                  </span>
                </div>
              ) : (
                <div className="text-green-700">
                  <div className="flex items-center mb-1">
                    <span className="inline-block mr-2">💾</span>
                    <span className="text-sm font-medium">
                      Ready for Save & Generate
                    </span>
                  </div>
                  <div className="text-xs text-green-600">
                    {selectedEndpoints.length} endpoint
                    {selectedEndpoints.length !== 1 ? "s" : ""} selected
                    <br />
                    Files will be generated using{" "}
                    <span className="underline">TinaCMS GraphQL</span> when you
                    hit save.
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedEndpoints.length > 0 && (
            <p className="text-xs text-black bg-yellow-100 p-2 rounded-md mb-4 break-all overflow-x-auto whitespace-pre">
              Following are the endpoint(s) that will have their mdx files
              generated.
            </p>
          )}
          <div className="mt-2 p-3 bg-gray-100 rounded text-xs text-gray-700 font-mono break-all overflow-x-auto whitespace-pre">
            {JSON.stringify(
              {
                schema: selectedSchema,
                tag: selectedTag,
                endpoints: selectedEndpoints,
              },
              null,
              2
            )}
          </div>
        </div>
      )}
    </div>
  );
});
