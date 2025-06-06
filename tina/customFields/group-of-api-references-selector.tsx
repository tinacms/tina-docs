import { detectLocalMode } from "@/src/utils/detectLocalMode";
import { generateFileName } from "@/src/utils/generateFileName";
import { parseFieldValue } from "@/src/utils/parseFieldValue";
import { sanitizeFileName } from "@/src/utils/sanitizeFilename";
import { showNotification } from "@/src/utils/showNotification";
import { config } from "@/tina/config";
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
    `/api/get-api-schema?filename=${encodeURIComponent(schemaFilename)}`
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
 * Loads endpoints for a specific tag from API schema
 */
const loadEndpointsForTag = (apiSchema: any, tag: string) => {
  const endpointsList: {
    id: string;
    label: string;
    method: string;
    path: string;
    summary: string;
    description: string;
  }[] = [];

  for (const path in apiSchema.paths) {
    for (const method in apiSchema.paths[path]) {
      const op = apiSchema.paths[path][method];
      if (op.tags?.includes(tag)) {
        endpointsList.push({
          id: `${method.toUpperCase()}:${path}`,
          label: `${method.toUpperCase()} ${path} - ${op.summary || ""}`,
          method: method.toUpperCase(),
          path,
          summary: op.summary || "",
          description: op.description || "",
        });
      }
    }
  }

  return endpointsList;
};

/**
 * Handles file generation via filesystem API
 */
const handleFileSystemGeneration = async (inputValue: string) => {
  const response = await fetch("/api/generate-api-docs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      apiGroupData: inputValue,
    }),
  });

  const result = await response.json();

  if (response.ok) {
    showNotification(
      `✅ Generated ${result.files.length} MDX files locally`,
      "success"
    );
  } else {
    if (response.status === 403 && result.suggestion) {
      showNotification(
        "⚠️ Filesystem generation not available in this environment",
        "warning"
      );
    } else {
      throw new Error(result.error || "Failed to generate files");
    }
  }
};

/**
 * Clear directory via filesystem API
 */
const clearDirectoryViaFilesystem = async (directoryPath: string) => {
  const response = await fetch("/api/clear-directory", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ directoryPath }),
  });

  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.error || "Failed to clear directory");
  }

  return await response.json();
};

/**
 * Get TinaCMS authentication token
 */
const getTinaCMSToken = (): string | null => {
  const tinacmsAuthString = localStorage.getItem("tinacms-auth");
  let token: string | null = null;
  try {
    const authData = tinacmsAuthString ? JSON.parse(tinacmsAuthString) : null;
    token = authData?.id_token || config.token || null;
  } catch (e) {
    token = config.token || null;
  }
  return token;
};

/**
 * Delete file via TinaCMS GraphQL
 */
const deleteFileViaTinaCMS = async (filePath: string) => {
  const clientId = config.clientId;
  const branch = config.branch;

  if (!clientId || !branch) {
    throw new Error("Missing TinaCMS configuration for file deletion");
  }

  const token = getTinaCMSToken();
  const tinaEndpoint = `https://content.tinajs.io/1.5/content/${clientId}/github/${branch}`;

  const mutation = `
    mutation DeleteDocument($collection: String!, $relativePath: String!) {
      deleteDocument(collection: $collection, relativePath: $relativePath) {
        __typename
      }
    }
  `;

  const variables = {
    collection: "docs",
    relativePath: filePath,
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(tinaEndpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      query: mutation,
      variables: variables,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  if (result.errors) {
    throw new Error(result.errors.map((e: any) => e.message).join(", "));
  }
};

/**
 * Clear directory via TinaCMS GraphQL (list and delete all files)
 */
const clearDirectoryViaTinaCMS = async (directoryPath: string) => {
  const clientId = config.clientId;
  const branch = config.branch;

  if (!clientId || !branch) {
    throw new Error("Missing TinaCMS configuration for directory clearing");
  }

  const token = getTinaCMSToken();
  const tinaEndpoint = `https://content.tinajs.io/1.5/content/${clientId}/github/${branch}`;

  // TinaCMS relativePaths are relative to the collection root (content/docs)
  // So we need to remove the 'docs/' prefix for the query
  const relativeDirectoryPath = directoryPath.replace(/^docs\//, "");

  // Get all docs and filter in JavaScript since GraphQL filters don't work
  const listQuery = `
    query GetAllDocs {
      docsConnection {
        edges {
          node {
            id
            _sys {
              filename
              relativePath
            }
          }
        }
      }
    }
  `;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const listResponse = await fetch(tinaEndpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      query: listQuery,
    }),
  });

  if (!listResponse.ok) {
    throw new Error(`Failed to list files: HTTP ${listResponse.status}`);
  }

  const listResult = await listResponse.json();
  if (listResult.errors) {
    throw new Error(
      `List query errors: ${listResult.errors
        .map((e: any) => e.message)
        .join(", ")}`
    );
  }

  // Filter files in JavaScript to find ones in our target directory
  const allFiles = listResult.data?.docsConnection?.edges || [];

  const filesToDelete = allFiles.filter((edge: any) => {
    const relativePath = edge.node._sys.relativePath;
    const matches = relativePath?.startsWith(`${relativeDirectoryPath}/`);
    return matches;
  });

  for (const edge of filesToDelete) {
    const relativePath = edge.node._sys.relativePath;
    try {
      await deleteFileViaTinaCMS(relativePath);
    } catch (error) {
      // Continue processing other files
    }
  }
};

/**
 * Creates docs via TinaCMS GraphQL mutation - CLIENT SIDE
 */
const createDocsViaTinaClientSide = async (
  groupData: any
): Promise<{
  success: boolean;
  createdFiles: string[];
  errors: string[];
}> => {
  const results = {
    success: true,
    createdFiles: [] as string[],
    errors: [] as string[],
  };

  if (!groupData.endpoints || groupData.endpoints.length === 0) {
    return { ...results, success: false, errors: ["No endpoints provided"] };
  }

  const { schema, tag, endpoints } = groupData;
  const tagDir = sanitizeFileName(tag);

  // Get config values for logging purposes
  const clientId = config.clientId;
  const branch = config.branch;

  if (!clientId) {
    return {
      ...results,
      success: false,
      errors: ["Missing TinaCMS client ID in config"],
    };
  }

  if (!branch) {
    return {
      ...results,
      success: false,
      errors: ["Missing TinaCMS branch in config"],
    };
  }

  const token = getTinaCMSToken();
  const tinaEndpoint = `https://content.tinajs.io/1.5/content/${clientId}/github/${branch}`;

  for (const endpoint of endpoints) {
    try {
      const fileName = generateFileName(endpoint);
      const relativePath = `api-documentation/${tagDir}/${fileName}.mdx`;

      // Create title from summary or generate one
      const title = endpoint.summary || `${endpoint.method} ${endpoint.path}`;
      const description =
        endpoint.description ||
        `API endpoint for ${endpoint.method} ${endpoint.path}`;

      // Use fetch with the correct TinaCloud endpoint and auth token
      const mutation = `
        mutation AddPendingDocument($collection: String!, $relativePath: String!) {
          addPendingDocument(collection: $collection, relativePath: $relativePath) {
            __typename
          }
        }
      `;

      const variables = {
        collection: "docs",
        relativePath,
      };

      // Prepare headers with authentication using TinaCMS internal pattern
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Add auth token using the internal TinaCMS pattern
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(tinaEndpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
          query: mutation,
          variables: variables,
        }),
      });

      if (!response.ok) {
        let errorDetails = `HTTP error! status: ${response.status}`;
        try {
          const errorBody = await response.text();
          if (errorBody) {
            errorDetails += ` - Response: ${errorBody}`;
          }
        } catch (e) {
          // Ignore if we can't read the response body
        }
        throw new Error(errorDetails);
      }

      const result = await response.json();

      if (result.errors) {
        const errorMessages = result.errors
          .map((e: any) => e.message)
          .join(", ");
        results.errors.push(
          `Failed to create ${relativePath}: ${errorMessages}`
        );
        results.success = false;
      } else if (result.data?.addPendingDocument) {
        results.createdFiles.push(relativePath);

        // Now try to update it with content
        try {
          const updateMutation = `
            mutation UpdateDocs($relativePath: String!, $params: DocsMutation!) {
              updateDocs(relativePath: $relativePath, params: $params) {
                __typename
                id
                title
              }
            }
          `;

          const updateVariables = {
            relativePath,
            params: {
              title,
              last_edited: new Date().toISOString(),
              seo: {
                title,
                description,
              },
              // Add basic structured content
              body: {
                type: "root",
                children: [
                  {
                    type: "h1",
                    children: [{ type: "text", text: title }],
                  },
                  {
                    type: "p",
                    children: [
                      {
                        type: "text",
                        text:
                          description ||
                          `Documentation for ${endpoint.method} ${endpoint.path}`,
                      },
                    ],
                  },
                  {
                    type: "p",
                    children: [
                      { type: "text", text: `Method: ${endpoint.method}` },
                    ],
                  },
                  {
                    type: "p",
                    children: [
                      { type: "text", text: `Path: ${endpoint.path}` },
                    ],
                  },
                ],
              },
            },
          };

          await fetch(tinaEndpoint, {
            method: "POST",
            headers,
            body: JSON.stringify({
              query: updateMutation,
              variables: updateVariables,
            }),
          });
        } catch (updateError) {
          // Don't fail the overall operation for update errors
        }
      } else {
        results.errors.push(
          `Failed to create ${relativePath}: No data returned`
        );
        results.success = false;
      }
    } catch (error) {
      const errorMsg = `Failed to create file for ${endpoint.method} ${
        endpoint.path
      }: ${error instanceof Error ? error.message : "Unknown error"}`;
      results.errors.push(errorMsg);
      results.success = false;
    }
  }

  return results;
};

/**
 * Handles TinaCMS file generation
 */
const handleTinaCMSGeneration = async (
  inputValue: string,
  selectedEndpoints: any[]
) => {
  // Parse the group data
  let groupData: any;
  try {
    groupData =
      typeof inputValue === "string" ? JSON.parse(inputValue) : inputValue;
  } catch (error) {
    throw new Error("Invalid API group data format");
  }

  // Filter endpoints to only create the specified files
  const filteredEndpoints = groupData.endpoints.filter((endpoint: any) => {
    return selectedEndpoints.some((ep) => ep.id === endpoint.id);
  });

  // Create filtered group data for generation
  const filteredGroupData = {
    ...groupData,
    endpoints: filteredEndpoints,
  };

  // Call the client-side GraphQL function directly
  const results = await createDocsViaTinaClientSide(filteredGroupData);

  if (results.success) {
    showNotification(
      `✅ Created ${results.createdFiles.length} MDX files via TinaCMS`,
      "success"
    );
  } else {
    const errorMsg =
      results.errors.length > 0
        ? `Partially successful: created ${results.createdFiles.length} files, ${results.errors.length} errors`
        : "Failed to create files";
    showNotification(`⚠️ ${errorMsg}`, "warning");
  }
};

/**
 * Clear the entire tag directory
 */
const clearTagDirectory = async (
  tagDirectoryPath: string,
  isLocalMode: boolean
) => {
  try {
    if (isLocalMode) {
      await clearDirectoryViaFilesystem(tagDirectoryPath);
    } else {
      await clearDirectoryViaTinaCMS(tagDirectoryPath);
    }
  } catch (error) {
    // Continue anyway - maybe the directory doesn't exist yet
  }
};

// ========================================
// MAIN COMPONENT
// ========================================

const GroupOfApiReferencesSelector = wrapFieldsWithMeta((props: any) => {
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
  const [generatingFiles, setGeneratingFiles] = React.useState(false);
  const [lastSavedValue, setLastSavedValue] = React.useState<string>("");

  const isLocalMode = detectLocalMode();
  const parsedValue = parseFieldValue(input.value);
  const selectedEndpoints = Array.isArray(parsedValue.endpoints)
    ? parsedValue.endpoints
    : [];

  // Detect form submission and trigger file generation
  React.useEffect(() => {
    const handleFormSave = async () => {
      // Check if this is a form save by detecting when the field becomes "not dirty"
      // and the value has changed from what we last processed
      const currentValue = input.value || "";
      const hasValidSelection =
        selectedSchema && selectedTag && selectedEndpoints.length > 0;
      if (
        !meta.dirty &&
        currentValue !== lastSavedValue &&
        hasValidSelection &&
        !generatingFiles
      ) {
        setLastSavedValue(currentValue);
        setGeneratingFiles(true);

        try {
          // Step 1: Clear the entire tag directory
          const tagDir = sanitizeFileName(selectedTag);
          const tagDirectoryPath = `docs/api-documentation/${tagDir}`;

          // Clear directory in all environments to ensure proper cleanup
          await clearTagDirectory(tagDirectoryPath, isLocalMode);

          // Step 2: Generate all selected files
          if (selectedEndpoints.length > 0) {
            if (isLocalMode) {
              await handleFileSystemGeneration(input.value);
            } else {
              await handleTinaCMSGeneration(input.value, selectedEndpoints);
            }
          }
        } catch (error) {
          showNotification(
            `❌ Failed to generate files: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
            "error"
          );
        } finally {
          setGeneratingFiles(false);
        }
      }
    };

    // Small delay to ensure meta.dirty state is updated
    const timeoutId = setTimeout(handleFormSave, 100);
    return () => clearTimeout(timeoutId);
  }, [
    meta.dirty,
    input.value,
    selectedSchema,
    selectedTag,
    selectedEndpoints.length,
    lastSavedValue,
    generatingFiles,
    isLocalMode,
  ]);

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

        // If we have existing data, load tags and endpoints
        if (currentSchema) {
          await loadTagsAndEndpoints(currentSchema, currentTag);
        }
      } catch (error) {
        setSchemas([]);
        setLoadingSchemas(false);
      }
    };

    loadInitialData();
  }, [parsedValue.schema, parsedValue.tag]);

  const loadTagsAndEndpoints = async (
    schemaFilename: string,
    currentTag?: string
  ) => {
    setLoadingTags(true);
    try {
      const { tags: tagsList, apiSchema } = await loadTagsForSchema(
        schemaFilename
      );
      setTags(tagsList);
      setLoadingTags(false);

      // If we also have a selected tag, load endpoints
      if (currentTag && apiSchema) {
        setLoadingEndpoints(true);
        const endpointsList = loadEndpointsForTag(apiSchema, currentTag);
        setEndpoints(endpointsList);
        setLoadingEndpoints(false);
      }
    } catch (error) {
      setTags([]);
      setLoadingTags(false);
    }
  };

  // Handle schema change
  const handleSchemaChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const schema = e.target.value;

    // Only update if schema actually changed to reduce form disruption
    if (schema === selectedSchema) return;

    setSelectedSchema(schema);
    setSelectedTag("");
    setTags([]);
    setEndpoints([]);

    // Update form state once at the end
    input.onChange(JSON.stringify({ schema, tag: "", endpoints: [] }));

    if (!schema) {
      setLoadingTags(false);
      return;
    }

    await loadTagsAndEndpoints(schema);
  };

  // Handle tag change
  const handleTagChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tag = e.target.value;

    // Only update if tag actually changed
    if (tag === selectedTag) return;

    setSelectedTag(tag);
    setEndpoints([]);

    // Update form state once
    input.onChange(
      JSON.stringify({ schema: selectedSchema, tag, endpoints: [] })
    );

    if (!tag || !selectedSchema) {
      setLoadingEndpoints(false);
      return;
    }

    try {
      const { apiSchema } = await loadTagsForSchema(selectedSchema);
      if (apiSchema) {
        setLoadingEndpoints(true);
        const endpointsList = loadEndpointsForTag(apiSchema, tag);
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
        <select
          value={selectedSchema}
          onChange={handleSchemaChange}
          disabled={loadingSchemas}
          className="w-full px-4 py-2 rounded-lg border border-slate-300 text-base bg-slate-50 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
        >
          <option value="">
            {loadingSchemas
              ? "Loading schemas..."
              : schemas.length === 0
              ? "No schemas available"
              : "Select a schema"}
          </option>
          {schemas.map((schema) => (
            <option key={schema.id} value={schema.filename}>
              {schema.displayName}
            </option>
          ))}
        </select>
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
          <label className="font-bold text-slate-800 text-base mb-2 block">
            Group/Tag
          </label>
          <select
            value={selectedTag}
            onChange={handleTagChange}
            disabled={loadingTags}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 text-base bg-slate-50 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
          >
            <option value="">
              {loadingTags ? "Loading tags..." : "Select a tag"}
            </option>
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>
      )}
      {selectedTag && (
        <div>
          <div className="flex items-center mb-3">
            <label className="font-bold text-slate-800 text-base mr-4">
              Endpoints
            </label>
            <button
              type="button"
              onClick={handleSelectAll}
              disabled={loadingEndpoints}
              className="ml-auto px-4 py-1.5 rounded-md bg-blue-600 text-white font-semibold text-sm shadow hover:bg-blue-700 transition-colors border border-blue-700 disabled:opacity-50"
            >
              Select All
            </button>
          </div>
          {loadingEndpoints ? (
            <div className="text-slate-400 text-sm mb-4">
              Loading endpoints...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto overflow-x-auto border border-gray-200 rounded-lg bg-slate-50 p-4 mb-4">
              {endpoints.map((ep) => (
                <label
                  key={ep.id}
                  className={`flex items-center rounded-md px-2 py-2 cursor-pointer transition-colors border ${
                    selectedEndpoints.some((selected) => selected.id === ep.id)
                      ? "bg-indigo-50 border-indigo-400 shadow"
                      : "bg-white border-gray-200"
                  } hover:bg-indigo-100`}
                >
                  <input
                    type="checkbox"
                    checked={selectedEndpoints.some(
                      (selected) => selected.id === ep.id
                    )}
                    onChange={() => handleEndpointCheckbox(ep.id)}
                    className="accent-indigo-600 w-5 h-5 mr-3 cursor-pointer"
                  />
                  <span
                    className="text-slate-700 text-sm font-medium truncate"
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
                    Files will be generated when you save this form using{" "}
                    <span className="underline">
                      {isLocalMode ? "filesystem method" : "TinaCMS GraphQL"}
                    </span>
                  </div>
                </div>
              )}
            </div>
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

export default GroupOfApiReferencesSelector;
