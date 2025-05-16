import React, { useEffect, useState, useContext, createContext } from "react";
import { client } from "@/tina/__generated__/client";

// Context to share schema definitions across components
const SchemaContext = createContext<any>({});

// Interface for endpoint details
interface Endpoint {
  path: string;
  method: string;
  summary: string;
  description?: string;
  operationId?: string;
  parameters?: any[];
  responses?: Record<string, any>;
  tags?: string[];
  requestBody?: any;
}

// Interface for parsed Swagger/OpenAPI details
interface SchemaDetails {
  title?: string;
  version?: string;
  endpoints: Endpoint[];
}

// Helper to resolve $ref references
const resolveReference = (ref: string, definitions: any): any => {
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

// Component to display an example value for a schema
const SchemaExample = ({ schema }: { schema: any }) => {
  const definitions = useContext(SchemaContext);

  const generateExample = (schema: any, depth = 0): any => {
    if (depth > 3) return "..."; // Limit recursion depth

    // Handle $ref
    if (schema.$ref) {
      const refSchema = resolveReference(schema.$ref, definitions);
      if (refSchema) {
        return generateExample(refSchema, depth);
      }
      return `<${schema.$ref.split("/").pop()}>`;
    }

    // Handle different types
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
          const itemExample = generateExample(schema.items, depth + 1);
          return [itemExample];
        }
        return [];
      case "object":
        if (schema.properties) {
          const obj: any = {};
          Object.entries(schema.properties).forEach(
            ([key, prop]: [string, any]) => {
              obj[key] = generateExample(prop, depth + 1);
            }
          );
          return obj;
        }
        return {};
      default:
        if (schema.properties) {
          // Object without explicit type
          const obj: any = {};
          Object.entries(schema.properties).forEach(
            ([key, prop]: [string, any]) => {
              obj[key] = generateExample(prop, depth + 1);
            }
          );
          return obj;
        }
        return null;
    }
  };

  const example = generateExample(schema);

  return (
    <div className="mt-2 p-3 bg-gray-50 rounded-md">
      <div className="text-xs text-gray-500 mb-1">Example:</div>
      <pre className="text-sm overflow-auto p-2 bg-gray-800 text-gray-100 rounded">
        {JSON.stringify(example, null, 2)}
      </pre>
    </div>
  );
};

// Type rendering component for recursively displaying schema structures
const SchemaType = ({
  schema,
  depth = 0,
  isNested = false,
  name = "",
  showExampleButton = false,
  onToggleExample = () => {},
}: {
  schema: any;
  depth?: number;
  isNested?: boolean;
  name?: string;
  showExampleButton?: boolean;
  onToggleExample?: () => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(depth < 2); // Auto-expand first two levels
  const definitions = useContext(SchemaContext);

  // Handle null schema
  if (!schema) return <span className="text-gray-500">-</span>;

  // Handle reference schemas
  if (schema.$ref) {
    const refPath = schema.$ref;
    const refName = refPath.split("/").pop();
    const refSchema = resolveReference(refPath, definitions);

    return (
      <div className={`${isNested ? "ml-4" : ""}`}>
        <div className="flex items-center">
          <button
            className="mr-2 w-5 h-5 rounded-sm flex items-center justify-center border border-gray-300 hover:bg-gray-100 focus:outline-none"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? "−" : "+"}
          </button>
          <span className="text-purple-600 font-medium">{refName}</span>
          {showExampleButton && (
            <button
              className="ml-2 text-xs text-blue-600 hover:underline focus:outline-none"
              onClick={onToggleExample}
            >
              Show example
            </button>
          )}
        </div>

        {isExpanded && refSchema && (
          <div className="mt-1 border-l-2 border-gray-200 pl-4">
            <SchemaType schema={refSchema} depth={depth + 1} isNested={true} />
          </div>
        )}
      </div>
    );
  }

  // Get type or infer it from properties
  let type =
    schema.type ||
    (schema.properties ? "object" : schema.items ? "array" : "unknown");

  // If it's a simple type with no nested objects
  if (
    ["string", "number", "integer", "boolean"].includes(type) &&
    !schema.properties &&
    !schema.items
  ) {
    return (
      <div className={`${isNested ? "ml-4" : ""}`}>
        <div className="flex items-center">
          <span className="text-blue-600 font-mono">{type}</span>
          {schema.format && (
            <span className="text-gray-500 ml-1">({schema.format})</span>
          )}
          {schema.enum && (
            <span className="text-gray-600 ml-1">
              enum: [{schema.enum.map((val: any) => `"${val}"`).join(", ")}]
            </span>
          )}
          {schema.default !== undefined && (
            <span className="text-gray-600 ml-1">
              default:{" "}
              {typeof schema.default === "string"
                ? `"${schema.default}"`
                : JSON.stringify(schema.default)}
            </span>
          )}
          {showExampleButton && (
            <button
              className="ml-2 text-xs text-blue-600 hover:underline focus:outline-none"
              onClick={onToggleExample}
            >
              Show example
            </button>
          )}
        </div>
      </div>
    );
  }

  // Complex objects and arrays
  return (
    <div className={`${isNested ? "ml-4" : ""}`}>
      <div className="flex items-center">
        <button
          className="mr-2 w-5 h-5 rounded-sm flex items-center justify-center border border-gray-300 hover:bg-gray-100 focus:outline-none"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? "−" : "+"}
        </button>

        <span className="text-blue-600 font-mono">{type}</span>
        {name && <span className="ml-2 font-medium">{name}</span>}

        {!isExpanded && type === "object" && schema.properties && (
          <span className="text-gray-500 ml-2">
            {`{${Object.keys(schema.properties).join(", ")}}`}
          </span>
        )}

        {!isExpanded && type === "array" && schema.items && (
          <span className="text-gray-500 ml-2">
            {`[${
              schema.items.type || (schema.items.properties ? "object" : "any")
            }]`}
          </span>
        )}

        {showExampleButton && (
          <button
            className="ml-2 text-xs text-blue-600 hover:underline focus:outline-none"
            onClick={onToggleExample}
          >
            Show example
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="mt-1 border-l-2 border-gray-200 pl-4">
          {type === "object" && schema.properties && (
            <div>
              {Object.entries(schema.properties).map(
                ([propName, propSchema]: [string, any]) => (
                  <div key={propName} className="mt-2">
                    <div className="flex items-start">
                      <span className="text-gray-800 font-medium mr-2">
                        {propName}
                      </span>
                      {schema.required?.includes(propName) && (
                        <span className="text-red-500 text-xs font-medium">
                          required
                        </span>
                      )}
                    </div>
                    <SchemaType
                      schema={propSchema}
                      depth={depth + 1}
                      isNested={true}
                      name={propName}
                    />
                  </div>
                )
              )}
              {!Object.keys(schema.properties).length && (
                <span className="text-gray-500 italic">Empty object</span>
              )}
            </div>
          )}

          {type === "array" && schema.items && (
            <div className="mt-1">
              <div className="text-gray-800 font-medium mb-1">Array items:</div>
              <SchemaType
                schema={schema.items}
                depth={depth + 1}
                isNested={true}
              />
            </div>
          )}

          {/* Additional properties */}
          {schema.additionalProperties && (
            <div className="mt-2">
              <div className="text-gray-800 font-medium">
                Additional properties:
              </div>
              <SchemaType
                schema={
                  typeof schema.additionalProperties === "boolean"
                    ? { type: "any" }
                    : schema.additionalProperties
                }
                depth={depth + 1}
                isNested={true}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Component to render a schema section with example toggle
const SchemaSection = ({ schema, title }: { schema: any; title?: string }) => {
  const [showExample, setShowExample] = useState(false);

  const toggleExample = () => {
    setShowExample(!showExample);
  };

  if (!schema) return null;

  return (
    <div className="mb-3">
      {title && (
        <div className="text-sm font-medium text-gray-700 mb-2">{title}</div>
      )}
      <SchemaType
        schema={schema}
        showExampleButton={true}
        onToggleExample={toggleExample}
      />
      {showExample && <SchemaExample schema={schema} />}
    </div>
  );
};

// Component to render a response
const ResponseContent = ({ response }: { response: any }) => {
  // Get schema from different possible locations in OpenAPI spec
  const schema =
    response.content?.["application/json"]?.schema ||
    response.schema ||
    response;

  if (!schema) return <div className="text-gray-500">No schema defined</div>;

  return (
    <div className="mt-2">
      <SchemaSection schema={schema} />
    </div>
  );
};

const ApiReference = (data: any) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schemaDetails, setSchemaDetails] = useState<SchemaDetails | null>(
    null
  );
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(
    null
  );
  const [schemaDefinitions, setSchemaDefinitions] = useState<any>({});
  const [rawSchema, setRawSchema] = useState<any>(null);

  useEffect(() => {
    const fetchAndParseSchema = async () => {
      try {
        setLoading(true);

        // Parse the combined schema and endpoint value
        let schemaPath = "";
        let endpointSelector = "";

        if (data.schemaFile && typeof data.schemaFile === "string") {
          const parts = data.schemaFile.split("|");
          schemaPath = parts[0];
          if (parts.length > 1) {
            endpointSelector = parts[1];
          }
        }

        if (!schemaPath) {
          setError("No schema file specified");
          setLoading(false);
          return;
        }

        // Fetch the schema file
        const result = await client.queries.apiSchema({
          relativePath: schemaPath,
        });

        if (!result?.data?.apiSchema?.apiSchema) {
          setError(`Could not load schema: ${schemaPath}`);
          setLoading(false);
          return;
        }

        // Parse the schema JSON
        const schemaJson = JSON.parse(result.data.apiSchema.apiSchema);
        setRawSchema(schemaJson);

        // Store schema definitions for references
        const definitions = {
          definitions: schemaJson.definitions || {},
          components: schemaJson.components || {},
          // For OpenAPI 3.0
          schemas:
            (schemaJson.components && schemaJson.components.schemas) || {},
        };
        setSchemaDefinitions(definitions);

        // Process the schema to extract endpoints
        const endpoints: Endpoint[] = [];
        if (schemaJson.paths) {
          Object.keys(schemaJson.paths).forEach((path) => {
            const pathObj = schemaJson.paths[path];
            Object.keys(pathObj).forEach((method) => {
              if (method === "parameters") return; // Skip path-level parameters

              const operation = pathObj[method];

              // Handle request body for OpenAPI 3.0 or Swagger 2.0
              const requestBody =
                operation.requestBody ||
                (operation.parameters?.some((p: any) => p.in === "body") && {
                  content: {
                    "application/json": {
                      schema:
                        operation.parameters.find((p: any) => p.in === "body")
                          ?.schema || {},
                    },
                  },
                });

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
              });
            });
          });
        }

        // Set the schema details
        setSchemaDetails({
          title: schemaJson.info?.title || "API Documentation",
          version: schemaJson.info?.version,
          endpoints,
        });

        // Find the selected endpoint if specified
        if (endpointSelector) {
          const [method, ...pathParts] = endpointSelector.split(":");
          const path = pathParts.join(":"); // Rejoin in case path had colons

          const endpoint = endpoints.find(
            (e) => e.method === method && e.path === path
          );

          setSelectedEndpoint(endpoint || null);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error loading API schema:", error);
        setError("An error occurred while loading the API schema");
        setLoading(false);
      }
    };

    fetchAndParseSchema();
  }, [data.schemaFile]);

  if (loading) {
    return (
      <div className="p-4 border border-gray-200 rounded-md">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-md text-red-700">
        <h3 className="font-medium">Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!schemaDetails) {
    return (
      <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-md text-yellow-700">
        <h3 className="font-medium">No API Schema</h3>
        <p>Could not load API schema details.</p>
      </div>
    );
  }

  // Render a single endpoint
  const renderEndpoint = (endpoint: Endpoint) => {
    return (
      <div
        key={`${endpoint.method}-${endpoint.path}`}
        className="mb-8 border border-gray-200 rounded-md overflow-hidden"
      >
        <div
          className={`p-4 flex items-center gap-4 ${
            endpoint.method === "GET"
              ? "bg-blue-50 border-b border-blue-200"
              : endpoint.method === "POST"
              ? "bg-green-50 border-b border-green-200"
              : endpoint.method === "PUT"
              ? "bg-yellow-50 border-b border-yellow-200"
              : endpoint.method === "DELETE"
              ? "bg-red-50 border-b border-red-200"
              : "bg-gray-50 border-b border-gray-200"
          }`}
        >
          <span
            className={`px-3 py-1 rounded-md text-sm font-bold ${
              endpoint.method === "GET"
                ? "bg-blue-100 text-blue-800"
                : endpoint.method === "POST"
                ? "bg-green-100 text-green-800"
                : endpoint.method === "PUT"
                ? "bg-yellow-100 text-yellow-800"
                : endpoint.method === "DELETE"
                ? "bg-red-100 text-red-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {endpoint.method}
          </span>
          <span className="font-mono text-sm">{endpoint.path}</span>
        </div>

        <div className="p-4">
          {endpoint.summary && (
            <h3 className="text-lg font-semibold mb-2">{endpoint.summary}</h3>
          )}

          {endpoint.description && (
            <div className="mb-4 text-gray-700 prose">
              {endpoint.description}
            </div>
          )}

          {/* Parameters section - only show if there are non-body parameters */}
          {endpoint.parameters && endpoint.parameters.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-medium mb-3">Parameters</h4>
              <div className="space-y-4">
                {endpoint.parameters.map((param: any, index: number) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-md p-4"
                  >
                    <div className="flex items-center mb-2">
                      <span className="font-medium mr-2">{param.name}</span>
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          param.required
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {param.required ? "required" : "optional"}
                      </span>
                      <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">
                        {param.in}
                      </span>
                    </div>

                    {param.description && (
                      <p className="text-gray-600 mb-3 text-sm">
                        {param.description}
                      </p>
                    )}

                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Type:
                      </span>
                      <SchemaContext.Provider value={schemaDefinitions}>
                        <SchemaSection schema={param.schema || param} />
                      </SchemaContext.Provider>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Request Body section */}
          {endpoint.requestBody && (
            <div className="mb-6">
              <h4 className="text-lg font-medium mb-3">Request Body</h4>
              <div className="border border-gray-200 rounded-md p-4">
                {endpoint.requestBody.description && (
                  <p className="text-gray-600 mb-3">
                    {endpoint.requestBody.description}
                  </p>
                )}

                {endpoint.requestBody.required && (
                  <div className="mb-3">
                    <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800">
                      required
                    </span>
                  </div>
                )}

                {endpoint.requestBody.content &&
                  Object.keys(endpoint.requestBody.content).map(
                    (contentType) => (
                      <div key={contentType} className="mb-3">
                        <div className="text-sm font-medium text-gray-700 mb-2">
                          {contentType}:
                        </div>
                        <SchemaContext.Provider value={schemaDefinitions}>
                          <SchemaSection
                            schema={
                              endpoint.requestBody.content[contentType].schema
                            }
                            title={contentType}
                          />
                        </SchemaContext.Provider>
                      </div>
                    )
                  )}

                {!endpoint.requestBody.content &&
                  endpoint.requestBody.schema && (
                    <SchemaContext.Provider value={schemaDefinitions}>
                      <SchemaSection schema={endpoint.requestBody.schema} />
                    </SchemaContext.Provider>
                  )}
              </div>
            </div>
          )}

          {/* Responses section */}
          {endpoint.responses && Object.keys(endpoint.responses).length > 0 && (
            <div className="mb-4">
              <h4 className="text-lg font-medium mb-3">Responses</h4>
              <div className="space-y-4">
                {Object.entries(endpoint.responses).map(
                  ([code, response]: [string, any]) => (
                    <div
                      key={code}
                      className="border border-gray-200 rounded-md overflow-hidden"
                    >
                      <div
                        className={`p-3 ${
                          code.startsWith("2")
                            ? "bg-green-50 border-b border-green-200"
                            : code.startsWith("4") || code.startsWith("5")
                            ? "bg-red-50 border-b border-red-200"
                            : "bg-gray-50 border-b border-gray-200"
                        }`}
                      >
                        <span
                          className={`font-medium ${
                            code.startsWith("2")
                              ? "text-green-800"
                              : code.startsWith("4") || code.startsWith("5")
                              ? "text-red-800"
                              : "text-gray-800"
                          }`}
                        >
                          {code}
                        </span>
                        {response.description && (
                          <span className="ml-2 text-gray-700">
                            {response.description}
                          </span>
                        )}
                      </div>

                      <div className="p-3">
                        <SchemaContext.Provider value={schemaDefinitions}>
                          <ResponseContent response={response} />
                        </SchemaContext.Provider>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="api-reference">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1">{schemaDetails.title}</h2>
        {schemaDetails.version && (
          <div className="text-sm text-gray-500">
            API Version: {schemaDetails.version}
          </div>
        )}
      </div>

      <SchemaContext.Provider value={schemaDefinitions}>
        {selectedEndpoint ? (
          // Show only the selected endpoint
          renderEndpoint(selectedEndpoint)
        ) : (
          // Show all endpoints
          <div>
            {schemaDetails.endpoints.map((endpoint) =>
              renderEndpoint(endpoint)
            )}
          </div>
        )}
      </SchemaContext.Provider>
    </div>
  );
};

export default ApiReference;
