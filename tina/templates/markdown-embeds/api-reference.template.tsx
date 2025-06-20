import CustomDropdown, {
  type DropdownOption,
} from "@/components/ui/custom-dropdown";
import { client } from "@/tina/__generated__/client";
import React, { useCallback, useState, useEffect } from "react";
import { wrapFieldsWithMeta } from "tinacms";

// Define schema type to match the actual structure from the API
interface SchemaFile {
  id: string;
  relativePath: string;
  apiSchema?: string | null;
  _sys: {
    filename: string;
  };
}

// Interface for parsed Swagger/OpenAPI details
interface SchemaDetails {
  title?: string;
  version?: string;
  endpointCount: number;
  endpoints: Endpoint[];
}

// Interface for endpoint details
interface Endpoint {
  path: string;
  method: string;
  summary: string;
  operationId?: string;
}

// Custom field for selecting an API schema file
const SchemaSelector = wrapFieldsWithMeta((props: any) => {
  const { input, field } = props;
  const [schemas, setSchemas] = useState<SchemaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [schemaDetails, setSchemaDetails] = useState<SchemaDetails | null>(
    null
  );
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>("");

  // When input.value changes, parse it to extract schema and endpoint
  useEffect(() => {
    if (!input.value) {
      setSelectedEndpoint("");
      return;
    }

    // Check if the value contains endpoint information
    const parts = input.value.split("|");
    if (parts.length > 1) {
      setSelectedEndpoint(parts[1]);
    } else {
      setSelectedEndpoint("");
    }
  }, [input.value]);

  // Parse Swagger/OpenAPI JSON to extract details
  const parseSwaggerJson = useCallback((jsonContent: string): SchemaDetails => {
    try {
      const parsed = JSON.parse(jsonContent);

      // Extract endpoints
      const endpoints: Endpoint[] = [];
      if (parsed.paths) {
        for (const path of Object.keys(parsed.paths)) {
          const pathObj = parsed.paths[path];
          for (const method of Object.keys(pathObj)) {
            const operation = pathObj[method];
            endpoints.push({
              path,
              method: method.toUpperCase(),
              summary: operation.summary || `${method.toUpperCase()} ${path}`,
              operationId: operation.operationId,
            });
          }
        }
      }

      return {
        title: parsed.info?.title || "Unknown API",
        version: parsed.info?.version || "Unknown Version",
        endpointCount: endpoints.length,
        endpoints,
      };
    } catch (error) {
      return {
        title: "Error Parsing Schema",
        version: "Unknown",
        endpointCount: 0,
        endpoints: [],
      };
    }
  }, []);

  // Fetch schema details when a schema is selected
  useEffect(() => {
    if (!input.value) {
      setSchemaDetails(null);
      return;
    }

    // Extract just the schema path if an endpoint is selected
    const schemaPath = input.value.split("|")[0];

    const fetchSchemaDetails = async () => {
      setLoadingDetails(true);
      try {
        // Find the selected schema
        const selectedSchema = schemas.find(
          (s) => s.relativePath === schemaPath
        );

        if (selectedSchema?.apiSchema) {
          const details = parseSwaggerJson(selectedSchema.apiSchema);
          setSchemaDetails(details);
        } else {
          // If the schema content isn't in the current data, fetch it
          const result = await client.queries.apiSchema({
            relativePath: schemaPath,
          });

          if (result?.data?.apiSchema?.apiSchema) {
            const details = parseSwaggerJson(result.data.apiSchema.apiSchema);
            setSchemaDetails(details);
          }
        }
      } catch (error) {
        setSchemaDetails(null);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchSchemaDetails();
  }, [input.value, schemas, parseSwaggerJson]);

  // Fetch available schema files when component mounts
  useEffect(() => {
    const fetchSchemas = async () => {
      try {
        // Use the generated client to fetch all API schemas
        const result = await client.queries.apiSchemaConnection({
          first: 100,
        });

        if (result?.data?.apiSchemaConnection?.edges) {
          // Convert API response into our simpler SchemaFile interface
          const schemaFiles: SchemaFile[] = [];

          for (const edge of result.data.apiSchemaConnection.edges) {
            if (edge?.node) {
              schemaFiles.push({
                id: edge.node.id,
                relativePath: edge.node._sys.relativePath,
                apiSchema: edge.node.apiSchema,
                _sys: {
                  filename: edge.node._sys.filename,
                },
              });
            }
          }

          setSchemas(schemaFiles);
        } else {
          setSchemas([]);
        }

        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    fetchSchemas();
  }, []);

  const handleSchemaChange = (schemaPath: string) => {
    // Reset endpoint selection when schema changes
    setSelectedEndpoint("");
    input.onChange(schemaPath);
  };

  const handleEndpointChange = (endpoint: string) => {
    setSelectedEndpoint(endpoint);
    // Extract just the schema path
    const schemaPath = input.value.split("|")[0];
    // Combine schema path and endpoint
    input.onChange(endpoint ? `${schemaPath}|${endpoint}` : schemaPath);
  };

  // Helper function to create a unique endpoint identifier
  const createEndpointId = (endpoint: Endpoint) => {
    return `${endpoint.method}:${endpoint.path}`;
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <label className="block font-medium text-gray-700 mb-1">
        {field.label || "Select API Schema"}
      </label>
      {loading ? (
        <div className="py-2 px-3 bg-gray-100 rounded text-gray-500">
          Loading schemas...
        </div>
      ) : schemas.length === 0 ? (
        <div className="py-2 px-3 bg-red-50 text-red-500 rounded">
          No API schema files found. Please upload one in the Content Manager.
        </div>
      ) : (
        <div className="max-w-full w-full overflow-x-hidden">
          {/* Schema selector dropdown */}
          <CustomDropdown
            value={input.value?.split("|")[0]}
            onChange={handleSchemaChange}
            options={schemas.map<DropdownOption>((schema) => ({
              value: schema.relativePath,
              label: schema._sys.filename,
            }))}
            placeholder="Select a schema"
          />

          {input.value && (
            <div className="mt-3 p-3 bg-blue-50 text-blue-600 rounded text-sm w-full max-w-full overflow-x-hidden">
              <div className="font-medium mb-1 truncate break-words whitespace-normal max-w-full">
                Selected schema:{" "}
                <span className="truncate break-words whitespace-normal max-w-full">
                  {
                    schemas.find(
                      (s) => s.relativePath === input.value.split("|")[0]
                    )?._sys.filename
                  }
                </span>
              </div>

              {loadingDetails ? (
                <div className="text-blue-500">Loading schema details...</div>
              ) : schemaDetails ? (
                <>
                  <div className="grid grid-cols-3 gap-2 mt-2 w-full max-w-full">
                    <div className="bg-blue-100 p-2 rounded w-full max-w-full break-words whitespace-normal">
                      <div className="text-xs text-blue-500 truncate break-words whitespace-normal max-w-full">
                        API Name
                      </div>
                      <div className="font-medium truncate break-words whitespace-normal max-w-full">
                        {schemaDetails.title}
                      </div>
                    </div>
                    <div className="bg-blue-100 p-2 rounded w-full max-w-full break-words whitespace-normal">
                      <div className="text-xs text-blue-500 truncate break-words whitespace-normal max-w-full">
                        Version
                      </div>
                      <div className="font-medium truncate break-words whitespace-normal max-w-full">
                        {schemaDetails.version}
                      </div>
                    </div>
                    <div className="bg-blue-100 p-2 rounded w-full max-w-full break-words whitespace-normal">
                      <div className="text-xs text-blue-500 truncate break-words whitespace-normal max-w-full">
                        Endpoints
                      </div>
                      <div className="font-medium truncate break-words whitespace-normal max-w-full">
                        {schemaDetails.endpointCount}
                      </div>
                    </div>
                  </div>

                  {/* Endpoint selector */}
                  {schemaDetails.endpoints.length > 0 && (
                    <div className="mt-4 w-full max-w-full overflow-x-hidden">
                      <label className="block text-blue-700 font-medium mb-1">
                        Select Endpoint (Optional)
                      </label>
                      {/* Endpoint selector dropdown */}
                      <CustomDropdown
                        value={selectedEndpoint}
                        onChange={handleEndpointChange}
                        options={schemaDetails.endpoints
                          .sort((a, b) => a.path.localeCompare(b.path))
                          .map<DropdownOption>((endpoint) => ({
                            value: createEndpointId(endpoint),
                            label: `${endpoint.method} ${endpoint.path} ${
                              endpoint.summary ? `- ${endpoint.summary}` : ""
                            }`,
                          }))}
                        placeholder="All Endpoints"
                        contentClassName="bg-white border border-blue-300"
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-blue-500">
                  Unable to load schema details
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {field.description && (
        <p className="mt-1 text-sm text-gray-500 break-words whitespace-normal max-w-full">
          {field.description}
        </p>
      )}

      <div className="mt-4 p-3 bg-gray-50 text-gray-600 rounded-md text-sm break-words whitespace-normal max-w-full">
        <p>
          <strong>Note:</strong> To add more schema files, go to the Content
          Manager and add files to the API Schema collection.
        </p>
      </div>
    </div>
  );
});

export const ApiReferenceTemplate = {
  name: "apiReference",
  label: "API Reference",
  ui: {
    defaultItem: {
      schemaFile: "test-doc.json",
    },
  },
  fields: [
    {
      type: "string",
      name: "schemaFile",
      label: "API Schema",
      description:
        "Select a Swagger/OpenAPI schema file to display in this component. Optionally select a specific endpoint to display.",
      ui: {
        component: SchemaSelector,
      },
    },
  ],
};

export default ApiReferenceTemplate;
