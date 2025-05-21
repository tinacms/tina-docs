import React, { useEffect, useState, useContext, createContext } from "react";
import { client } from "@/tina/__generated__/client";
import { MdOutlineAdd, MdOutlineRemove } from "react-icons/md";
import { CodeBlock } from "@/components/tina-markdown/standard-elements/code-block/code-block";

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
  security?: any[];
}

// Interface for parsed Swagger/OpenAPI details
interface SchemaDetails {
  title?: string;
  version?: string;
  endpoints: Endpoint[];
  securityDefinitions?: Record<string, any>;
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

// Move example generation logic to a helper function
const generateExample = (schema: any, definitions: any, depth = 0): any => {
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
        Object.entries(schema.properties).forEach(
          ([key, prop]: [string, any]) => {
            obj[key] = generateExample(prop, definitions, depth + 1);
          }
        );
        return obj;
      }
      return {};
    default:
      if (schema.properties) {
        const obj: any = {};
        Object.entries(schema.properties).forEach(
          ([key, prop]: [string, any]) => {
            obj[key] = generateExample(prop, definitions, depth + 1);
          }
        );
        return obj;
      }
      return null;
  }
};

// Component to display an example value for a schema
const SchemaExample = ({ schema }: { schema: any }) => {
  const definitions = useContext(SchemaContext);

  const example = generateExample(schema, definitions);

  return (
    <div className="mt-2 p-3 rounded-md">
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
  isErrorSchema = false,
}: {
  schema: any;
  depth?: number;
  isNested?: boolean;
  name?: string;
  showExampleButton?: boolean;
  onToggleExample?: () => void;
  isErrorSchema?: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(false); // Auto-expand first two levels and error schemas
  const definitions = useContext(SchemaContext);

  // Handle null schema
  if (!schema) return <span className="text-gray-500">-</span>;

  // Handle reference schemas
  if (schema.$ref) {
    const refPath = schema.$ref;
    const refName = refPath.split("/").pop();
    const refSchema = resolveReference(refPath, definitions);

    // Check if this is likely an error schema by name
    const probableErrorSchema =
      refName &&
      (refName.toLowerCase().includes("error") ||
        refName.toLowerCase().includes("problem") ||
        refName.toLowerCase().includes("exception"));

    return (
      <div className={`ml-4`}>
        <div
          className="flex items-center w-full cursor-pointer group"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? "Collapse" : "Expand"}
          tabIndex={0}
          role="button"
          onKeyPress={(e) => {
            if (e.key === "Enter" || e.key === " ") setIsExpanded(!isExpanded);
          }}
        >
          <span className="flex items-end">
            <span className="text-neutral-text group-hover:underline ">
              {refName}
            </span>
            {refSchema && refSchema.type && (
              <span className="ml-2 text-xs font-mono text-neutral-text px-2 pb-0.5 rounded">
                {refSchema.type}
              </span>
            )}
          </span>
          {showExampleButton && (
            <button
              className="ml-4 text-xs text-neutral-text hover:underline focus:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExample();
              }}
              tabIndex={-1}
            >
              JSON Schema Example
            </button>
          )}
          <span className="ml-auto flex items-center text-2xl text-neutral-text">
            {isExpanded ? "−" : "+"}
          </span>
        </div>
        {isExpanded &&
          refSchema &&
          refSchema.type === "object" &&
          refSchema.properties && (
            <div className="mt-1 pl-4">
              {Object.entries(refSchema.properties).map(
                ([propName, propSchema]) => (
                  <div key={propName}>
                    <SchemaType
                      schema={propSchema as any}
                      name={propName}
                      depth={depth + 1}
                      isNested={true}
                    />
                  </div>
                )
              )}
            </div>
          )}
        {isExpanded && refSchema && refSchema.type !== "object" && (
          <div className="mt-1 pl-4">
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

  // Check for common error fields
  const hasErrorFields =
    schema.properties &&
    (schema.properties.error ||
      schema.properties.message ||
      schema.properties.code ||
      schema.properties.errors ||
      schema.properties.detail);

  // Complex objects and arrays
  const isArrayOfObjects =
    type === "array" &&
    schema.items &&
    (schema.items.properties || schema.items.$ref);

  const isExpandable =
    schema.$ref ||
    (type === "object" &&
      schema.properties &&
      Object.keys(schema.properties).length > 0) ||
    isArrayOfObjects;

  // If not expandable, show primitive type info
  if (!isExpandable) {
    return (
      <div className={`${isNested ? "ml-4" : ""}`}>
        <div className="flex items-end">
          {name && <span className="text-neutral-text mr-2">{name}</span>}
          <span className="text-xs font-mono text-neutral-text px-2  pb-0.5 rounded">
            {type}
            {schema.format ? ` (${schema.format})` : ""}
          </span>
          {schema.enum && (
            <span className="ml-2 py-0.5 text-xs text-neutral-text font-mono">
              enum: [{schema.enum.map((v: any) => JSON.stringify(v)).join(", ")}
              ]
            </span>
          )}
        </div>
        {schema.description && (
          <div className="text-sm text-neutral-text-secondary mb-2">
            {schema.description}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`${isNested ? "ml-4" : ""}`}>
      <div
        className={`flex items-center w-full${
          isExpandable ? " cursor-pointer group" : ""
        }`}
        onClick={isExpandable ? () => setIsExpanded(!isExpanded) : undefined}
        aria-label={
          isExpandable ? (isExpanded ? "Collapse" : "Expand") : undefined
        }
        tabIndex={isExpandable ? 0 : -1}
        role={isExpandable ? "button" : undefined}
        onKeyPress={
          isExpandable
            ? (e) => {
                if (e.key === "Enter" || e.key === " ")
                  setIsExpanded(!isExpanded);
              }
            : undefined
        }
      >
        {name && (
          <span
            className={`mr-2  group-hover:underline ${
              isErrorSchema || hasErrorFields ? "text-red-600" : ""
            }`}
          >
            {name}
          </span>
        )}
        {type === "array" && schema.items && (
          <span className="text-neutral-text font-mono text-xs ml-2">
            {schema.items && (schema.items.properties || schema.items.$ref)
              ? "array [object]"
              : `array [${
                  schema.items && schema.items.type ? schema.items.type : "any"
                }]`}
          </span>
        )}
        {isExpandable && (
          <span className="ml-auto flex items-center text-2xl text-neutral-text">
            {isExpanded ? "−" : "+"}
          </span>
        )}
        {/* For top-level arrays, show the button immediately after the type */}
        {showExampleButton && depth === 0 && type === "array" && (
          <button
            className="ml-2 text-xs text-neutral-text hover:underline focus:outline-none"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExample();
            }}
          >
            JSON Schema Example
          </button>
        )}
        {/* For top-level objects and $ref, keep button at the end as before */}
        {showExampleButton && depth === 0 && type !== "array" && (
          <button
            className="ml-auto text-xs text-neutral-text hover:underline focus:outline-none"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExample();
            }}
            style={{ marginLeft: "auto" }}
          >
            JSON Schema Example
          </button>
        )}
        {/* For nested, keep inline */}
        {showExampleButton && depth !== 0 && (
          <button
            className="ml-2 text-xs text-blue-600 hover:underline focus:outline-none"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExample();
            }}
          >
            Show example
          </button>
        )}
      </div>
      {isExpanded && (
        <div className=" pl-4">
          {type === "object" && schema.properties && (
            <div>
              {Object.entries(schema.properties).map(
                ([propName, propSchema]: [string, any]) => {
                  // Determine type and format
                  let propType =
                    propSchema.type ||
                    (propSchema.properties
                      ? "object"
                      : propSchema.items
                      ? "array"
                      : "unknown");
                  let format = propSchema.format;
                  let isArray = propType === "array";
                  let itemType = isArray
                    ? propSchema.items?.type ||
                      (propSchema.items?.properties ? "object" : "any")
                    : null;
                  let enumVals = propSchema.enum;
                  const isObject =
                    propType === "object" && propSchema.properties;
                  return (
                    <React.Fragment key={propName}>
                      <div className="flex items-center mb-1">
                        <span className="font-mono text-neutral-text mr-2">
                          {propName}
                        </span>
                        <span className="text-xs font-mono text-neutral-text px-2 py-0.5 rounded">
                          {isArray ? `[${itemType}]` : propType}
                          {format ? ` (${format})` : ""}
                        </span>
                        {enumVals && (
                          <span className="ml-2 text-xs text-neutral-text">
                            enum: [
                            {enumVals
                              .map((v: any) => JSON.stringify(v))
                              .join(", ")}
                            ]
                          </span>
                        )}
                      </div>
                      {propSchema.description && (
                        <div className="text-sm text-neutral-text-secondary ml-2 mb-1">
                          {propSchema.description}
                        </div>
                      )}
                      {/* Recursively render nested object or array of objects */}
                      {isObject && (
                        <div className="ml-4">
                          <SchemaType
                            schema={propSchema}
                            depth={depth + 1}
                            isNested={true}
                            name={propName}
                          />
                        </div>
                      )}
                    </React.Fragment>
                  );
                }
              )}
              {!Object.keys(schema.properties).length && (
                <span className="text-gray-500 italic">Empty object</span>
              )}
            </div>
          )}
          {isArrayOfObjects && (
            <div>
              <SchemaType
                schema={schema.items}
                depth={depth + 1}
                isNested={true}
                isErrorSchema={isErrorSchema}
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
                isErrorSchema={isErrorSchema}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Component to render a schema section with example toggle
const SchemaSection = ({
  schema,
  title,
  isErrorSchema = false,
}: {
  schema: any;
  title?: string;
  isErrorSchema?: boolean;
}) => {
  const [showExample, setShowExample] = useState(false);

  const toggleExample = () => {
    setShowExample(!showExample);
  };

  if (!schema) return null;

  return (
    <div>
      {title && (
        <div
          className={`text-sm font-medium mb-2 ${
            isErrorSchema ? "text-red-700" : "text-gray-700"
          }`}
        >
          {title}
        </div>
      )}
      <SchemaType
        schema={schema}
        showExampleButton={true}
        onToggleExample={toggleExample}
        isErrorSchema={isErrorSchema}
      />
      {showExample && <SchemaExample schema={schema} />}
    </div>
  );
};

// Update TabbedSchemaSection to use CodeBlock for the Example tab
const TabbedSchemaSection = ({
  schema,
  title,
  isErrorSchema = false,
}: {
  schema: any;
  title?: string;
  isErrorSchema?: boolean;
}) => {
  const [tab, setTab] = useState<"schema" | "example">("schema");
  const definitions = useContext(SchemaContext);
  const example = generateExample(schema, definitions);
  const schemaTabRef = React.useRef<HTMLButtonElement>(null);
  const jsonTabRef = React.useRef<HTMLButtonElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const activeRef = tab === "schema" ? schemaTabRef : jsonTabRef;
    if (activeRef.current) {
      const { offsetLeft, offsetWidth } = activeRef.current;
      setIndicatorStyle({ left: offsetLeft, width: offsetWidth });
    }
  }, [tab]);

  return (
    <div>
      <div className="relative flex border-b-[0.5px] border-neutral-border mb-3">
        <button
          ref={schemaTabRef}
          className={`px-4 py-2 font-medium cursor-pointer ${
            tab === "schema"
              ? "text-brand-secondary"
              : "text-neutral-text-secondary"
          }`}
          onClick={() => setTab("schema")}
        >
          Schema
        </button>
        <button
          ref={jsonTabRef}
          className={`px-4 py-2 font-medium cursor-pointer ${
            tab === "example"
              ? "text-brand-secondary"
              : "text-neutral-text-secondary"
          }`}
          onClick={() => setTab("example")}
        >
          JSON
        </button>
        <div
          className="absolute bottom-0 h-[0.5px] bg-brand-secondary transition-all duration-200"
          style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
        />
      </div>
      {tab === "schema" ? (
        <SchemaType
          schema={schema}
          showExampleButton={false}
          isErrorSchema={isErrorSchema}
        />
      ) : (
        <CodeBlock value={JSON.stringify(example, null, 2)} lang="json" />
      )}
    </div>
  );
};

// Component to render a response
const ResponseContent = ({
  response,
  isErrorResponse = false,
}: {
  response: any;
  isErrorResponse?: boolean;
}) => {
  // For error responses, show a simplified version
  if (isErrorResponse) {
    // Check if there's any schema to show
    const hasSchema =
      response.content ||
      response.schema ||
      (typeof response === "object" &&
        Object.keys(response).length > 0 &&
        !response.description); // Avoid showing just the description again

    if (!hasSchema) return null;

    return (
      <div className="mt-2">
        <div className="text-sm text-red-700 mb-2">Error response schema:</div>
        {/* Use the same rendering logic as non-error responses but with error styling */}
        {renderResponseContent(response, true)}
      </div>
    );
  }

  return renderResponseContent(response, false);

  // Helper function to render response content
  function renderResponseContent(response: any, isError: boolean) {
    // Check if the response has content with multiple media types
    if (response.content && Object.keys(response.content).length > 0) {
      return (
        <div className="mt-2">
          {Object.entries(response.content).map(
            ([contentType, contentObj]: [string, any]) => (
              <div key={contentType} className="mb-3">
                <div
                  className={`text-sm font-medium mb-1 ${
                    isError ? "text-red-700" : "text-gray-700"
                  }`}
                >
                  {contentType}:
                </div>
                {contentObj.schema ? (
                  <TabbedSchemaSection
                    schema={contentObj.schema}
                    isErrorSchema={isError}
                  />
                ) : (
                  <div className="text-gray-500">
                    No schema defined for this content type
                  </div>
                )}
              </div>
            )
          )}
        </div>
      );
    }

    // Fallback to direct schema or the response itself
    const schema = response.schema || response;

    if (
      !schema ||
      (typeof schema === "object" && Object.keys(schema).length === 0)
    ) {
      return <div className="text-gray-500">No schema defined</div>;
    }

    return (
      <div className="mt-2">
        <TabbedSchemaSection schema={schema} isErrorSchema={isError} />
      </div>
    );
  }
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
  const [expandedResponses, setExpandedResponses] = useState<
    Map<string, boolean>
  >(new Map());

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
              let requestBody: any = undefined;
              if (operation.requestBody) {
                requestBody = operation.requestBody;
              } else if (
                operation.parameters?.some((p: any) => p.in === "body")
              ) {
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
            });
          });
        }

        // Set the schema details
        setSchemaDetails({
          title: schemaJson.info?.title || "API Documentation",
          version: schemaJson.info?.version,
          endpoints,
          securityDefinitions: schemaJson.securityDefinitions || {},
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

  // Initialize expanded state for all endpoint responses
  useEffect(() => {
    if (schemaDetails?.endpoints) {
      const initialExpandedState = new Map();
      schemaDetails.endpoints.forEach((endpoint) => {
        if (endpoint.responses) {
          Object.keys(endpoint.responses).forEach((code) => {
            // Create a unique key for each endpoint-code pair
            const key = `${endpoint.method}-${endpoint.path}-${code}`;
            initialExpandedState.set(key, false);
          });
        }
      });
      setExpandedResponses(initialExpandedState);
    }
  }, [schemaDetails]);

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
      <div key={endpoint.path + endpoint.method} className="mb-12">
        <div className={`py-4 flex items-center gap-4`}>
          <span
            className={`px-3 py-1 rounded-md text-sm shadow-sm font-bold ${
              endpoint.method === "GET"
                ? "bg-[#B4EFD9] text-green-800"
                : endpoint.method === "POST"
                ? "bg-[#B4DBFF] text-blue-800"
                : endpoint.method === "PUT"
                ? "bg-[#FEF3C7] text-yellow-800"
                : endpoint.method === "DELETE"
                ? "bg-[#FEE2E2] text-red-800"
                : "bg-gray-50 "
            }`}
          >
            {endpoint.method}
          </span>
          <span className="font-mono text-neutral-text text-sm brand-glass-gradient shadow-sm rounded-lg px-2 py-1 ">
            {endpoint.path}
          </span>
        </div>

        <div className="">
          {/* Parameters section - only show if there are non-body parameters */}
          {endpoint.parameters && endpoint.parameters.length > 0 && (
            <div className="mb-6">
              <h4 className="text-2xl text-neutral-text  mb-3">
                Path Parameters
              </h4>
              <hr className="border-t border-gray-200 mb-4" />
              <div className="space-y-4">
                {endpoint.parameters.map((param: any, index: number) => (
                  <div key={index}>
                    <div className="flex items-center mb-2">
                      <span className="text-neutral-text mr-2">
                        {param.name}
                      </span>
                      <span className="mr-2 px-2 py-0.5 brand-glass-gradient shadow-sm font-mono text-xs text-neutral-text rounded-md">
                        {param.in}
                      </span>
                      <span className="mr-2 px-2 py-0.5 brand-glass-gradient shadow-sm font-mono text-xs text-neutral-text rounded-md">
                        {param.type}
                      </span>
                      {param.required && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-brand-primary text-white font-tuner">
                          required
                        </span>
                      )}
                    </div>

                    {param.description && (
                      <p className="text-neutral-text-secondary mb-3 text-sm">
                        {param.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Request Body section */}
          {endpoint.requestBody && (
            <div className="mb-6">
              <div className="flex items-center mb-3">
                <h4 className="text-2xl text-neutral-text mr-3">
                  Request Body
                </h4>
                {endpoint.requestBody.required && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800">
                    required
                  </span>
                )}
              </div>
              <hr className="border-t border-gray-200 mb-4" />
              <div className="rounded-md p-3 brand-glass-gradient shadow-lg items-center">
                {endpoint.requestBody.description && (
                  <p className="text-neutral-text">
                    {endpoint.requestBody.description}
                  </p>
                )}

                {endpoint.requestBody.content &&
                  Object.entries(endpoint.requestBody.content).map(
                    ([contentType, contentObj]: [string, any]) => (
                      <div key={contentType} className="rounded-lg">
                        <SchemaContext.Provider value={schemaDefinitions}>
                          <TabbedSchemaSection
                            schema={
                              endpoint.requestBody.content[contentType].schema
                            }
                            isErrorSchema={false}
                          />
                        </SchemaContext.Provider>
                      </div>
                    )
                  )}

                {!endpoint.requestBody.content &&
                  endpoint.requestBody.schema && (
                    <SchemaContext.Provider value={schemaDefinitions}>
                      <TabbedSchemaSection
                        schema={endpoint.requestBody.schema}
                        isErrorSchema={false}
                      />
                    </SchemaContext.Provider>
                  )}
              </div>
            </div>
          )}

          {/* Responses section */}
          <div className="mb-4">
            <h4 className="text-2xl text-neutral-text mb-3">Responses</h4>
            <hr className="border-t border-gray-200 mb-4" />
            {(() => {
              const nonErrorResponses = Object.entries(
                endpoint.responses || {}
              ).filter(
                ([code]) => !code.startsWith("4") && !code.startsWith("5")
              );
              if (nonErrorResponses.length === 0) {
                return (
                  <div className="text-neutral-text-secondary text-sm">
                    No responses defined for this endpoint.
                  </div>
                );
              }
              return (
                <div className="space-y-4">
                  {nonErrorResponses.map(([code, response]: [string, any]) => {
                    const isErrorResponse =
                      code.startsWith("4") || code.startsWith("5");
                    const responseKey = `${endpoint.method}-${endpoint.path}-${code}`;
                    const hasExpandableContent =
                      response &&
                      ((response.content &&
                        Object.keys(response.content).length > 0) ||
                        response.schema ||
                        (typeof response === "object" &&
                          Object.keys(response).some(
                            (k) => k !== "description"
                          )));
                    return (
                      <div
                        key={code}
                        className=" rounded-md overflow-hidden brand-glass-gradient shadow-md"
                      >
                        <div
                          className={`p-3  ${
                            hasExpandableContent ? "cursor-pointer" : ""
                          }`}
                          onClick={
                            hasExpandableContent
                              ? () => {
                                  const newExpandedResponses = new Map(
                                    expandedResponses
                                  );
                                  newExpandedResponses.set(
                                    responseKey,
                                    !expandedResponses.get(responseKey)
                                  );
                                  setExpandedResponses(newExpandedResponses);
                                }
                              : undefined
                          }
                          title={
                            hasExpandableContent
                              ? "Click to expand/collapse"
                              : undefined
                          }
                        >
                          <div className="flex items-center w-full">
                            <span
                              className={`px-2 py-0.5 rounded-md inline-block ${
                                code.startsWith("2")
                                  ? "bg-[#B4EFD9] text-green-800 font-bold"
                                  : isErrorResponse
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-200 text-gray-800 font-tuner text-center"
                              }`}
                            >
                              {code}
                            </span>
                            {response.description && (
                              <span
                                className={`ml-2
                                   text-neutral-text`}
                              >
                                {response.description}
                              </span>
                            )}
                            {hasExpandableContent && (
                              <span
                                className="ml-auto text-2xl select-none pointer-events-none flex items-center text-neutral-text"
                                style={{ minWidth: 28 }}
                              >
                                {expandedResponses.get(responseKey) ? "−" : "+"}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Show schema details only when expanded */}
                        {hasExpandableContent &&
                          expandedResponses.get(responseKey) && (
                            <div className="p-3">
                              <SchemaContext.Provider value={schemaDefinitions}>
                                <ResponseContent
                                  response={response}
                                  isErrorResponse={isErrorResponse}
                                />
                              </SchemaContext.Provider>
                            </div>
                          )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* Errors section for 4XX and 5XX */}
          {Object.entries(endpoint.responses || {}).some(
            ([code]) => code.startsWith("4") || code.startsWith("5")
          ) && (
            <div className="mt-8">
              <h4 className="text-2xl text-neutral-text mb-3">Errors</h4>
              <hr className="border-t border-gray-200 mb-4" />
              <div className="space-y-4">
                {Object.entries(endpoint.responses || {})
                  .filter(
                    ([code]) => code.startsWith("4") || code.startsWith("5")
                  )
                  .map(([code, response]: [string, any]) => {
                    const isErrorResponse = true;
                    const responseKey = `${endpoint.method}-${endpoint.path}-${code}`;
                    const hasExpandableContent =
                      response &&
                      ((response.content &&
                        Object.keys(response.content).length > 0) ||
                        response.schema ||
                        (typeof response === "object" &&
                          Object.keys(response).some(
                            (k) => k !== "description"
                          )));
                    return (
                      <div
                        key={code}
                        className=" rounded-md overflow-hidden shadow-md"
                      >
                        <div
                          className={`p-3 brand-glass-gradient ${
                            hasExpandableContent
                              ? "cursor-pointer hover:bg-opacity-80 transition-colors"
                              : ""
                          }`}
                          onClick={
                            hasExpandableContent
                              ? () => {
                                  const newExpandedResponses = new Map(
                                    expandedResponses
                                  );
                                  newExpandedResponses.set(
                                    responseKey,
                                    !expandedResponses.get(responseKey)
                                  );
                                  setExpandedResponses(newExpandedResponses);
                                }
                              : undefined
                          }
                          title={
                            hasExpandableContent
                              ? "Click to expand/collapse"
                              : undefined
                          }
                        >
                          <div className="flex items-center w-full">
                            <span className="px-2 py-0.5 rounded-md inline-block bg-[#FEE2E2] font-bold text-red-800">
                              {code}
                            </span>
                            {response.description && (
                              <span className="ml-2 text-neutral-text">
                                {response.description}
                              </span>
                            )}
                            {hasExpandableContent && (
                              <span
                                className="ml-auto text-2xl font-bold select-none pointer-events-none flex items-center"
                                style={{ minWidth: 28 }}
                              >
                                {expandedResponses.get(responseKey) ? "−" : "+"}
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Show schema details only when expanded */}
                        {hasExpandableContent &&
                          expandedResponses.get(responseKey) && (
                            <div className="p-3">
                              <SchemaContext.Provider value={schemaDefinitions}>
                                <ResponseContent
                                  response={response}
                                  isErrorResponse={isErrorResponse}
                                />
                              </SchemaContext.Provider>
                            </div>
                          )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="api-reference mb-40">
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
