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

  const selectedSchema = parsedValue.schema || "";
  const selectedTag = parsedValue.tag || "";
  const selectedEndpoints = Array.isArray(parsedValue.endpoints)
    ? parsedValue.endpoints
    : [];

  // Load schemas and initialize existing data
  useEffect(() => {
    const loadData = async () => {
      // First load schemas
      setLoadingSchemas(true);
      const result = await client.queries.apiSchemaConnection({ first: 100 });
      const edges = result.data.apiSchemaConnection?.edges || [];
      const schemasList = edges.map((e: any) => e.node);
      setSchemas(schemasList);
      setLoadingSchemas(false);

      // If we have existing data, load tags and endpoints
      if (selectedSchema) {
        setLoadingTags(true);
        try {
          const schemaResult = await client.queries.apiSchema({
            relativePath: selectedSchema,
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
            if (selectedTag) {
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
                  if (op.tags && op.tags.includes(selectedTag)) {
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
          setTags([]);
          setLoadingTags(false);
        }
      }
    };

    loadData();
  }, []); // Only run once on mount

  // Handle schema change
  const handleSchemaChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const schema = e.target.value;
    input.onChange(JSON.stringify({ schema, tag: "", endpoints: [] }));

    if (!schema) {
      setTags([]);
      setEndpoints([]);
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
    input.onChange(
      JSON.stringify({ schema: selectedSchema, tag, endpoints: [] })
    );

    if (!tag || !selectedSchema) {
      setEndpoints([]);
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
            {loadingSchemas ? "Loading schemas..." : "Select a schema"}
          </option>
          {schemas.map((schema) => (
            <option key={schema.id} value={schema._sys.relativePath}>
              {schema._sys.filename}
            </option>
          ))}
        </select>
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
