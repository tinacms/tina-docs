import React, { useEffect, useState } from "react";
import { wrapFieldsWithMeta } from "tinacms";
import { client } from "@/tina/__generated__/client";

const GroupOfApiReferencesSelector = wrapFieldsWithMeta((props: any) => {
  const { input } = props;
  const [schemas, setSchemas] = useState<any[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [endpoints, setEndpoints] = useState<
    {
      id: string;
      label: string;
      method: string;
      path: string;
      summary: string;
      description: string;
    }[]
  >([]);
  const [loadingSchemas, setLoadingSchemas] = useState(true);
  const [loadingTags, setLoadingTags] = useState(false);
  const [loadingEndpoints, setLoadingEndpoints] = useState(false);
  const [selectedSchema, setSelectedSchema] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [generatingFiles, setGeneratingFiles] = useState(false);
  const [generatingViaGraphQL, setGeneratingViaGraphQL] = useState(false);

  // Parse the current value
  const parsedValue = (() => {
    try {
      return input.value
        ? JSON.parse(input.value)
        : { schema: "", tag: "", endpoints: [] };
    } catch {
      return { schema: "", tag: "", endpoints: [] };
    }
  })();

  const selectedEndpoints = Array.isArray(parsedValue.endpoints)
    ? parsedValue.endpoints
    : [];

  // Load schemas from filesystem API
  useEffect(() => {
    const loadSchemas = async () => {
      setLoadingSchemas(true);
      try {
        console.log("Loading API schemas from filesystem...");

        const response = await fetch("/api/list-api-schemas");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to load schemas");
        }

        console.log("API schema list result:", result);
        setSchemas(result.schemas || []);
        setLoadingSchemas(false);

        // Set local state from parsed values
        const currentSchema = parsedValue.schema || "";
        const currentTag = parsedValue.tag || "";
        setSelectedSchema(currentSchema);
        setSelectedTag(currentTag);

        // If we have existing data, load tags and endpoints
        if (currentSchema) {
          await loadTagsForSchema(currentSchema, currentTag);
        }
      } catch (error) {
        console.error("Error loading API schemas:", error);
        setSchemas([]);
        setLoadingSchemas(false);
      }
    };

    loadSchemas();
  }, []); // Run once on mount

  const loadTagsForSchema = async (
    schemaFilename: string,
    currentTag?: string
  ) => {
    setLoadingTags(true);
    try {
      const response = await fetch(
        `/api/get-api-schema?filename=${encodeURIComponent(schemaFilename)}`
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to load schema");
      }

      const apiSchema = result.apiSchema;
      if (apiSchema && apiSchema.paths) {
        const tagSet = new Set<string>();

        // Extract tags
        for (const path in apiSchema.paths) {
          for (const method in apiSchema.paths[path]) {
            const op = apiSchema.paths[path][method];
            if (op.tags) {
              op.tags.forEach((tag: string) => tagSet.add(tag));
            }
          }
        }

        const tagsList = Array.from(tagSet);
        setTags(tagsList);
        setLoadingTags(false);

        // If we also have a selected tag, load endpoints
        if (currentTag) {
          await loadEndpointsForTag(apiSchema, currentTag);
        }
      } else {
        setTags([]);
        setLoadingTags(false);
      }
    } catch (error) {
      console.error("Error loading tags for schema:", error);
      setTags([]);
      setLoadingTags(false);
    }
  };

  const loadEndpointsForTag = async (apiSchema: any, tag: string) => {
    setLoadingEndpoints(true);
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
        if (op.tags && op.tags.includes(tag)) {
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

    setEndpoints(endpointsList);
    setLoadingEndpoints(false);
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

    await loadTagsForSchema(schema);
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
      const response = await fetch(
        `/api/get-api-schema?filename=${encodeURIComponent(selectedSchema)}`
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to load schema");
      }

      await loadEndpointsForTag(result.apiSchema, tag);
    } catch (error) {
      console.error("Error loading endpoints:", error);
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

  const handleGenerateFiles = async () => {
    if (!input.value || selectedEndpoints.length === 0) {
      alert("Please select some endpoints first");
      return;
    }

    setGeneratingFiles(true);
    try {
      const response = await fetch("/api/generate-api-docs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiGroupData: input.value,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(
          `${result.message}\n\nFiles created:\n${result.files.join("\n")}`
        );
      } else {
        // Handle staging environment error specifically
        if (response.status === 403 && result.suggestion) {
          alert(
            `⚠️ ${result.error}\n\n💡 ${result.suggestion}\n\nThis feature is designed for local development where files can be written to the filesystem.`
          );
        } else {
          throw new Error(result.error || "Failed to generate files");
        }
      }
    } catch (error) {
      console.error("Failed to generate files:", error);
      alert(
        `Failed to generate MDX files: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setGeneratingFiles(false);
    }
  };

  /**
   * Generates a safe filename from endpoint data
   */
  function generateFileName(endpoint: any): string {
    const method = endpoint.method.toLowerCase();
    const pathSafe = endpoint.path
      .replace(/^\//, "") // Remove leading slash
      .replace(/\//g, "-") // Replace slashes with dashes
      .replace(/[{}]/g, "") // Remove curly braces
      .replace(/[^\w-]/g, "") // Remove any non-word characters except dashes
      .toLowerCase();

    return `${method}-${pathSafe}`;
  }

  /**
   * Sanitizes a string to be used as a directory/file name
   */
  function sanitizeFileName(name: string): string {
    return name
      .replace(/[^\w\s-]/g, "") // Remove special characters except spaces and dashes
      .replace(/\s+/g, "-") // Replace spaces with dashes
      .toLowerCase();
  }

  /**
   * Creates docs via TinaCMS GraphQL mutation - CLIENT SIDE
   */
  async function createDocsViaTinaClientSide(groupData: any): Promise<{
    success: boolean;
    createdFiles: string[];
    errors: string[];
  }> {
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

    // Use the client's configured URL which handles environment-specific endpoints
    // This way we don't hardcode client IDs or branches
    const tinaEndpoint = (client as any).client?.url || "/admin/index.html#/graphql";

    console.log(`Using TinaCMS endpoint: ${tinaEndpoint}`);

    for (const endpoint of endpoints) {
      try {
        const fileName = generateFileName(endpoint);
        const relativePath = `api-documentation/${tagDir}/${fileName}.mdx`;

        // Create title from summary or generate one
        const title = endpoint.summary || `${endpoint.method} ${endpoint.path}`;
        const description =
          endpoint.description ||
          `API endpoint for ${endpoint.method} ${endpoint.path}`;

        // Use fetch with the client's endpoint
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

        const response = await fetch(tinaEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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
          results.errors.push(
            `Failed to create ${relativePath}: ${result.errors
              .map((e: any) => e.message)
              .join(", ")}`
          );
          results.success = false;
        } else if (result.data?.addPendingDocument) {
          results.createdFiles.push(relativePath);
          console.log(`Created pending document via TinaCMS: ${relativePath}`);

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
                // Skip body for now to avoid rich text issues
              },
            };

            const updateResponse = await fetch(tinaEndpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                query: updateMutation,
                variables: updateVariables,
              }),
            });

            if (updateResponse.ok) {
              const updateResult = await updateResponse.json();
              if (updateResult.data?.updateDocs) {
                console.log(`Updated document content for: ${relativePath}`);
              }
            }
          } catch (updateError) {
            console.warn(
              `Failed to update content for ${relativePath}:`,
              updateError
            );
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
        console.error(errorMsg, error);
      }
    }

    return results;
  }

  const handleGenerateFilesViaGraphQL = async () => {
    if (!input.value || selectedEndpoints.length === 0) {
      alert("Please select some endpoints first");
      return;
    }

    setGeneratingViaGraphQL(true);
    try {
      // Parse the group data
      let groupData;
      try {
        groupData =
          typeof input.value === "string"
            ? JSON.parse(input.value)
            : input.value;
      } catch (error) {
        throw new Error("Invalid API group data format");
      }

      // Call the client-side GraphQL function directly
      const results = await createDocsViaTinaClientSide(groupData);

      if (results.success) {
        alert(
          `✅ Successfully created ${
            results.createdFiles.length
          } MDX files via TinaCMS!\n\nFiles created:\n${results.createdFiles.join(
            "\n"
          )}\n\nMethod: Client-side TinaCMS GraphQL`
        );
      } else {
        const errorMsg =
          results.errors.length > 0
            ? `❌ Partially successful: created ${
                results.createdFiles.length
              } files, ${
                results.errors.length
              } errors\n\nErrors:\n${results.errors.join(
                "\n"
              )}\n\nSuccessful files:\n${
                results.createdFiles?.join("\n") || "None"
              }`
            : `❌ Failed to create files`;
        alert(errorMsg);
      }
    } catch (error) {
      console.error("Failed to generate files via TinaCMS:", error);
      alert(
        `❌ Failed to create MDX files via TinaCMS: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setGeneratingViaGraphQL(false);
    }
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
            <br />
            • Missing TinaCMS client generation on staging
            <br />
            • Missing schema files deployment
            <br />
            • Environment configuration issues
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

          {/* Generate Files Buttons */}
          {selectedEndpoints.length > 0 && (
            <div className="mb-4 space-y-2">
              {/* TinaCMS GraphQL Method (Recommended) */}
              <button
                type="button"
                onClick={handleGenerateFilesViaGraphQL}
                disabled={generatingViaGraphQL}
                className="w-full px-4 py-2 rounded-md bg-blue-600 text-white font-semibold text-sm shadow hover:bg-blue-700 transition-colors border border-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingViaGraphQL ? (
                  <>
                    <span className="inline-block mr-2">⏳</span>
                    Creating via TinaCMS GraphQL...
                  </>
                ) : (
                  <>
                    <span className="inline-block mr-2">🚀</span>
                    Create via TinaCMS GraphQL ({selectedEndpoints.length}{" "}
                    endpoints)
                  </>
                )}
              </button>
              <div className="text-xs text-gray-600 text-center">
                ✨ Recommended: Works in all environments (dev, staging,
                production)
              </div>

              {/* Filesystem Method (Dev Only) */}
              <button
                type="button"
                onClick={handleGenerateFiles}
                disabled={generatingFiles}
                className="w-full px-4 py-2 rounded-md bg-green-600 text-white font-semibold text-sm shadow hover:bg-green-700 transition-colors border border-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingFiles ? (
                  <>
                    <span className="inline-block mr-2">⏳</span>
                    Generating MDX Files...
                  </>
                ) : (
                  <>
                    <span className="inline-block mr-2">📄</span>
                    Generate MDX Files - Dev Only ({
                      selectedEndpoints.length
                    }{" "}
                    endpoints)
                  </>
                )}
              </button>
              <div className="text-xs text-gray-600 text-center">
                💻 Direct filesystem write (development environment only)
              </div>
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
