import { CodeBlock } from "@/components/tina-markdown/standard-elements/code-block/code-block";
import { client } from "@/tina/__generated__/client";
import React, { useEffect, useState, useContext, createContext } from "react";
import type { IconBaseProps } from "react-icons";
import { FaChevronRight } from "react-icons/fa";
import { FaChevronDown } from "react-icons/fa";

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

// Wrapper component for the chevron icon
const ChevronIcon = ({ isExpanded }: { isExpanded: boolean }) => {
  const Icon = FaChevronRight as React.ComponentType<IconBaseProps>;
  return (
    <Icon
      className={`text-neutral-text transition-transform duration-200 ${
        isExpanded ? "rotate-90" : ""
      }`}
      style={{ width: "10px", height: "10px" }}
    />
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
      <div className="ml-4">
        <div className="ml-4">
          <button
            type="button"
            className="flex items-center w-full cursor-pointer group"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? "Collapse" : "Expand"}
            onKeyPress={(e) => {
              if (e.key === "Enter" || e.key === " ")
                setIsExpanded(!isExpanded);
            }}
          >
            <span className="flex items-end">
              <span
                className={`group-hover:underline${
                  isErrorSchema || probableErrorSchema ? " text-red-600" : ""
                }${name === "Array of object" ? " ml-4" : ""}`}
              >
                {refName}
              </span>
              {refSchema?.type && (
                <span className="ml-2 text-xs font-mono text-neutral-text-secondary px-2 pb-0.5 rounded">
                  {refSchema.type}
                </span>
              )}
            </span>
            {showExampleButton && (
              <button
                type="button"
                className="ml-4 text-xs text-neutral-text-secondary hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExample();
                }}
                tabIndex={-1}
              >
                JSON Schema Example
              </button>
            )}
            {refSchema && (
              <span className="ml-2 flex items-center">
                <ChevronIcon isExpanded={isExpanded} />
              </span>
            )}
          </button>
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
  const type =
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
          {name && (
            <span
              className={`text-neutral-text mr-2${
                name === "Array of object" ? " ml-4" : ""
              }`}
            >
              {name}
            </span>
          )}
          <span className="text-xs font-mono text-neutral-text-secondary px-2  pb-0.5 rounded">
            {type}
            {schema.format ? ` (${schema.format})` : ""}
          </span>
          {schema.enum && (
            <span className="ml-2 py-0.5 text-xs text-neutral-text-secondary font-mono">
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
        <div className="flex items-center">
          <div className="flex items-end gap-4">
            {name && (
              <span
                className={`group-hover:underline${
                  isErrorSchema || hasErrorFields ? " text-red-600" : ""
                }${name === "Array of object" ? " ml-4" : ""}`}
              >
                {name}
              </span>
            )}
            {type === "array" && schema.items && (
              <span className="text-neutral-text-secondary pb-0.5 font-mono text-xs">
                {schema.items && (schema.items.properties || schema.items.$ref)
                  ? "array [object]"
                  : `array [${schema.items?.type ? schema.items.type : "any"}]`}
              </span>
            )}
            {type === "object" && (
              <span className="text-neutral-text-secondary font-mono text-xs">
                object
              </span>
            )}

            {isExpandable && (
              <div className="pb-1">
                <ChevronIcon isExpanded={isExpanded} />
              </div>
            )}
          </div>
        </div>
        {showExampleButton && depth === 0 && type === "array" && (
          <button
            type="button"
            className="ml-2 text-xs text-neutral-text hover:underline focus:outline-none"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExample();
            }}
          >
            JSON Schema Example
          </button>
        )}
        {showExampleButton && depth === 0 && type !== "array" && (
          <button
            type="button"
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
        {showExampleButton && depth !== 0 && (
          <button
            type="button"
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
      {/* Animated expandable content */}
      <div
        className={`transition-all duration-300 overflow-hidden ${
          isExpanded ? "opacity-100" : "opacity-0"
        }`}
      >
        {isExpanded && (
          <div className="pl-4">
            {type === "object" && schema.properties && (
              <div>
                {Object.entries(schema.properties).map(
                  ([propName, propSchema]: [string, any]) => {
                    // Determine type and format
                    const propType =
                      propSchema.type ||
                      (propSchema.properties
                        ? "object"
                        : propSchema.items
                        ? "array"
                        : "unknown");
                    const format = propSchema.format;
                    const isArray = propType === "array";
                    const itemType = isArray
                      ? propSchema.items?.type ||
                        (propSchema.items?.properties ? "object" : "any")
                      : null;
                    const enumVals = propSchema.enum;
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
    </div>
  );
};

const RequestBodyDropdown = ({
  value,
  onChange,
}: {
  value: "schema" | "example";
  onChange: (v: "schema" | "example") => void;
}) => {
  return (
    <div className="relative inline-block text-left">
      <select
        tabIndex={-1}
        className="border-[0.25px] border-neutral-border rounded px-2 text-sm text-neutral-text-secondary bg-neutral-background min-w-[100px] flex items-center justify-between gap-2"
        value={value}
        onChange={(e) => {
          onChange(e.target.value as "schema" | "example");
        }}
      >
        <option value="schema">Schema</option>
        <option value="example">Example</option>
      </select>
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
  const [expandedResponses, setExpandedResponses] = useState<
    Map<string, boolean>
  >(new Map());
  const [requestBodyView, setRequestBodyView] = useState<"schema" | "example">(
    "schema"
  );
  const [responseView, setResponseView] = useState<
    Record<string, "schema" | "example">
  >({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!loading && schemaDetails) {
      // Force a reflow to ensure the animation triggers
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    }
  }, [loading, schemaDetails]);

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

        // Store schema definitions for references
        const definitions = {
          definitions: schemaJson.definitions || {},
          components: schemaJson.components || {},
          // For OpenAPI 3.0
          schemas: schemaJson.components?.schemas || {},
        };
        setSchemaDefinitions(definitions);

        // Process the schema to extract endpoints
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
            }
          }
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
      for (const endpoint of schemaDetails.endpoints) {
        if (endpoint.responses) {
          for (const code of Object.keys(endpoint.responses)) {
            const key = `${endpoint.method}-${endpoint.path}-${code}`;
            initialExpandedState.set(key, false);
          }
        }
      }
      setExpandedResponses(initialExpandedState);
    }
  }, [schemaDetails]);

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-md text-red-700">
        <h3 className="font-medium">Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!schemaDetails) {
    return (
      <div className="p-4 bg-yellow-50 rounded-md text-yellow-700">
        <h3 className="font-medium">No API Schema</h3>
        <p>Could not load API schema details.</p>
      </div>
    );
  }

  // Render a single endpoint
  const renderEndpoint = (endpoint: Endpoint) => {
    return (
      <div
        key={endpoint.path + endpoint.method}
        className="mb-12 dark:bg-neutral-background-secondary dark:border dark:border-neutral-border-subtle/40 bg-glass-gradient-end p-4 rounded-lg shadow-sm"
      >
        <div className="flex flex-col gap-2 pb-6">
          <div className="flex items-center gap-4">
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
                  : "bg-gray-50"
              }`}
            >
              {endpoint.method}
            </span>
            <span className="font-mono text-neutral-text text-sm brand-glass-gradient shadow-sm rounded-lg px-2 py-1 ">
              {endpoint.path}
            </span>
          </div>
          <span className="text-neutral-text-secondary text-sm">
            {endpoint?.description}
          </span>
        </div>

        <div className="">
          {/* Parameters section - only show if there are non-body parameters */}
          {endpoint.parameters && endpoint.parameters.length > 0 && (
            <div className="mb-8">
              <h4 className="text-xl text-neutral-text  mb-2">
                Path Parameters
              </h4>

              <div className="space-y-4 pl-3">
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
                        <span className="px-2 py-0.5 text-xs rounded-full bg-brand-primary text-neutral-text font-tuner">
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
            <div className="mb-8">
              <div className="flex items-center justify-between gap-2 mb-2">
                <h4 className="text-xl text-neutral-text">Request Body</h4>
                <RequestBodyDropdown
                  value={requestBodyView}
                  onChange={setRequestBodyView}
                />
              </div>
              {endpoint.requestBody.description && (
                <p className="text-neutral-text mb-2">
                  {endpoint.requestBody.description}
                </p>
              )}
              <div>
                {requestBodyView === "schema" ? (
                  <SchemaType
                    schema={
                      endpoint.requestBody.content
                        ? (
                            Object.values(
                              endpoint.requestBody.content
                            )[0] as any
                          ).schema
                        : endpoint.requestBody.schema
                    }
                    showExampleButton={false}
                    isErrorSchema={false}
                    name={(() => {
                      const schema = endpoint.requestBody.content
                        ? (
                            Object.values(
                              endpoint.requestBody.content
                            )[0] as any
                          ).schema
                        : endpoint.requestBody.schema;
                      if (schema?.type === "array") {
                        return "Array of object";
                      }
                      return undefined;
                    })()}
                  />
                ) : (
                  <CodeBlock
                    value={JSON.stringify(
                      generateExample(
                        endpoint.requestBody.content
                          ? (
                              Object.values(
                                endpoint.requestBody.content
                              )[0] as any
                            ).schema
                          : endpoint.requestBody.schema,
                        schemaDefinitions
                      ),
                      null,
                      2
                    )}
                    lang="json"
                  />
                )}
              </div>
            </div>
          )}

          {/* Responses section */}
          <div className="mb-8">
            <h4 className="text-xl text-neutral-text mb-2">Responses</h4>

            {(() => {
              const nonErrorResponses = Object.entries(
                endpoint.responses || {}
              ).filter(
                ([code]) => !code.startsWith("4") && !code.startsWith("5")
              );
              if (nonErrorResponses.length === 0) {
                return (
                  <div className="pl-3 text-neutral-text-secondary text-sm">
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
                    // Add dropdown state for this response
                    const view = responseView[responseKey] || "schema";
                    const setView = (v: "schema" | "example") =>
                      setResponseView((prev) => ({
                        ...prev,
                        [responseKey]: v,
                      }));
                    return (
                      <div key={code}>
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
                          <div className="flex items-center w-full justify-between gap-2">
                            <div className="flex items-center gap-2">
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
                                <span className="ml-2 text-neutral-text flex items-center gap-2">
                                  {response.description}
                                </span>
                              )}
                              {hasExpandableContent && (
                                <ChevronIcon
                                  isExpanded={
                                    expandedResponses.get(responseKey) || false
                                  }
                                />
                              )}
                            </div>
                            {hasExpandableContent && (
                              <div className="ml-auto relative">
                                <RequestBodyDropdown
                                  value={view}
                                  onChange={setView}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Show schema details only when expanded */}
                        {hasExpandableContent &&
                          expandedResponses.get(responseKey) && (
                            <div className="pb-3 px-3">
                              <SchemaContext.Provider value={schemaDefinitions}>
                                {view === "schema" ? (
                                  <SchemaType
                                    schema={(() => {
                                      if (
                                        response.content &&
                                        Object.keys(response.content).length > 0
                                      ) {
                                        const firstContent = Object.values(
                                          response.content
                                        )[0] as any;
                                        return firstContent.schema;
                                      }
                                      if (response.schema) {
                                        return response.schema;
                                      }
                                      return {};
                                    })()}
                                    showExampleButton={false}
                                    isErrorSchema={isErrorResponse}
                                  />
                                ) : (
                                  <CodeBlock
                                    value={JSON.stringify(
                                      (() => {
                                        if (
                                          response.content &&
                                          Object.keys(response.content).length >
                                            0
                                        ) {
                                          const firstContent = Object.values(
                                            response.content
                                          )[0] as any;
                                          return generateExample(
                                            firstContent.schema,
                                            schemaDefinitions
                                          );
                                        }
                                        if (response.schema) {
                                          return generateExample(
                                            response.schema,
                                            schemaDefinitions
                                          );
                                        }
                                        return {};
                                      })(),
                                      null,
                                      2
                                    )}
                                    lang="json"
                                  />
                                )}
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
            <div className="mb-8">
              <h4 className="text-xl text-neutral-text mb-2">Errors</h4>

              <div>
                {Object.entries(endpoint.responses || {})
                  .filter(
                    ([code]) => code.startsWith("4") || code.startsWith("5")
                  )
                  .map(([code, response]: [string, any], index: number) => {
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
                    // Add dropdown state for this response
                    const view = responseView[responseKey] || "schema";
                    const setView = (v: "schema" | "example") =>
                      setResponseView((prev) => ({
                        ...prev,
                        [responseKey]: v,
                      }));
                    return (
                      <div key={code}>
                        <div
                          className={`px-3 py-1 ${
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
                              <div className="flex items-center gap-2 ml-2">
                                <RequestBodyDropdown
                                  value={view}
                                  onChange={setView}
                                />
                                <span
                                  className="ml-auto text-2xl font-bold select-none pointer-events-none flex items-center"
                                  style={{ minWidth: 28 }}
                                >
                                  {expandedResponses.get(responseKey)
                                    ? "−"
                                    : "+"}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Show schema details only when expanded */}
                        {hasExpandableContent &&
                          expandedResponses.get(responseKey) && (
                            <div className="p-3">
                              <SchemaContext.Provider value={schemaDefinitions}>
                                {view === "schema" ? (
                                  <SchemaType
                                    schema={(() => {
                                      if (
                                        response.content &&
                                        Object.keys(response.content).length > 0
                                      ) {
                                        const firstContent = Object.values(
                                          response.content
                                        )[0] as any;
                                        return firstContent.schema;
                                      }
                                      if (response.schema) {
                                        return response.schema;
                                      }
                                      return {};
                                    })()}
                                    showExampleButton={false}
                                    isErrorSchema={isErrorResponse}
                                  />
                                ) : (
                                  <CodeBlock
                                    value={JSON.stringify(
                                      (() => {
                                        if (
                                          response.content &&
                                          Object.keys(response.content).length >
                                            0
                                        ) {
                                          const firstContent = Object.values(
                                            response.content
                                          )[0] as any;
                                          return generateExample(
                                            firstContent.schema,
                                            schemaDefinitions
                                          );
                                        }
                                        if (response.schema) {
                                          return generateExample(
                                            response.schema,
                                            schemaDefinitions
                                          );
                                        }
                                        return {};
                                      })(),
                                      null,
                                      2
                                    )}
                                    lang="json"
                                  />
                                )}
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
    <div
      className={`api-reference mb-40 transform transition-all duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
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
