import { client } from "@/tina/__generated__/client";
import React, { useEffect, useState } from "react";
import { wrapFieldsWithMeta } from "tinacms";

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

  // Load schemas and initialize existing data
  useEffect(() => {
    const loadData = async () => {
      // First load schemas
      setLoadingSchemas(true);
      try {
        console.log("Loading API schemas...");
        const result = await client.queries.apiSchemaConnection({ first: 100 });
        console.log("API schema connection result:", result);

        if (!result?.data?.apiSchemaConnection) {
          console.error("No apiSchemaConnection found in result");
          setSchemas([]);
          setLoadingSchemas(false);
          return;
        }

        const edges = result.data.apiSchemaConnection?.edges || [];
        console.log("Found schema edges:", edges);
        const schemasList = edges.map((e: any) => e.node);
        setSchemas(schemasList);
        setLoadingSchemas(false);

        // Set local state from parsed values
        const currentSchema = parsedValue.schema || "";
        const currentTag = parsedValue.tag || "";
        setSelectedSchema(currentSchema);
        setSelectedTag(currentTag);

        // If we have existing data, load tags and endpoints
        if (currentSchema) {
          setLoadingTags(true);
          try {
            const schemaResult = await client.queries.apiSchema({
              relativePath: currentSchema,
            });
            const raw = schemaResult.data.apiSchema?.apiSchema;
            if (raw) {
              const apiSchema = JSON.parse(raw);
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
                    if (op.tags && op.tags.includes(currentTag)) {
                      endpointsList.push({
                        id: `${method.toUpperCase()}:${path}`,
                        label: `${method.toUpperCase()} ${path} - ${
                          op.summary || ""
                        }`,
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
        }
      } catch (error) {
        console.error("Error loading API schemas:", error);
        setSchemas([]);
        setLoadingSchemas(false);
      }
    };

    loadData();
  }, []); // Only run once on mount

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

    setLoadingTags(true);
    try {
      const result = await client.queries.apiSchema({ relativePath: schema });
      const raw = result.data.apiSchema?.apiSchema;
      if (raw) {
        const apiSchema = JSON.parse(raw);
        const tagSet = new Set<string>();

        for (const path in apiSchema.paths) {
          for (const method in apiSchema.paths[path]) {
            const op = apiSchema.paths[path][method];
            if (op.tags) {
              op.tags.forEach((tag: string) => tagSet.add(tag));
            }
          }
        }

        setTags(Array.from(tagSet));
        setEndpoints([]);
      } else {
        setTags([]);
      }
    } catch (error) {
      setTags([]);
    }
    setLoadingTags(false);
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

    setLoadingEndpoints(true);
    try {
      const result = await client.queries.apiSchema({
        relativePath: selectedSchema,
      });
      const raw = result.data.apiSchema?.apiSchema;
      if (raw) {
        const apiSchema = JSON.parse(raw);
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
      } else {
        setEndpoints([]);
      }
    } catch (error) {
      setEndpoints([]);
    }
    setLoadingEndpoints(false);
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
        throw new Error(result.error || "Failed to generate files");
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
            <option key={schema.id} value={schema._sys.relativePath}>
              {schema._sys.filename}
            </option>
          ))}
        </select>
        {!loadingSchemas && schemas.length === 0 && (
          <div className="text-red-600 text-sm mt-1">
            ⚠️ No API schemas found. Please ensure schema files are uploaded to
            the "API Schema" collection.
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

          {/* Generate Files Button */}
          {selectedEndpoints.length > 0 && (
            <div className="mb-4">
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
                    Generate MDX Files ({selectedEndpoints.length} endpoints)
                  </>
                )}
              </button>
              <div className="text-xs text-gray-600 mt-1 text-center">
                This will create individual .mdx files for each selected
                endpoint
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
