import { CodeBlock } from "@/components/tina-markdown/standard-elements/code-block/code-block";
import { client } from "@/tina/__generated__/client";
// biome-ignore lint/style/useImportType:
import React, { useEffect, useState, createContext, useCallback } from "react";
import { ChevronIcon, SchemaType } from "./scheme-type";
import type {
  ApiReferenceProps,
  Endpoint,
  ExpandedResponsesState,
  RequestBodyDropdownProps,
  ResponseViewState,
  SchemaDetails,
} from "./types";

// Context to share schema definitions across components
const SchemaContext = createContext<any>({});

// Helper to resolve $ref references
export const resolveReference = (ref: string, definitions: any): any => {
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

const RequestBodyDropdown = ({ value, onChange }: RequestBodyDropdownProps) => {
  return (
    <div className="relative inline-block text-left">
      <select
        tabIndex={-1}
        className="border-[0.25px] border-neutral-border rounded px-2 text-sm text-neutral-text-secondary bg-neutral-background min-w-[100px] flex items-center justify-between gap-2"
        value={value}
        onClick={(e) => {
          // Prevent click event from bubbling up
          e.stopPropagation();
        }}
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

const ApiReference = (data: ApiReferenceProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schemaDetails, setSchemaDetails] = useState<SchemaDetails | null>(
    null
  );
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(
    null
  );
  const [schemaDefinitions, setSchemaDefinitions] = useState<any>({});
  const [expandedResponses, setExpandedResponses] =
    useState<ExpandedResponsesState>(new Map());
  const [requestBodyView, setRequestBodyView] = useState<"schema" | "example">(
    "schema"
  );
  const [responseView, setResponseView] = useState<ResponseViewState>({});
  const [isVisible, setIsVisible] = useState(false);

  // Helper function to set empty schema state
  const setEmptySchema = useCallback(() => {
    setSchemaDetails({
      title: "API Documentation",
      version: "",
      endpoints: [],
      securityDefinitions: {},
    });
    setLoading(false);
  }, []);

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
        let result: any;
        try {
          result = await client.queries.apiSchema({
            relativePath: schemaPath,
          });
        } catch (error) {
          setEmptySchema();
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
  }, [data.schemaFile, setEmptySchema]);

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
                        <span className="px-2 py-0.5 text-xs rounded-full bg-brand-primary-light text-black dark:text-white font-tuner">
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
      className={`api-reference ${
        schemaDetails.endpoints && schemaDetails.endpoints.length > 0
          ? "mb-40"
          : ""
      } transform transition-all duration-700 ease-out ${
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
            {schemaDetails.endpoints && schemaDetails.endpoints.length > 0 ? (
              schemaDetails.endpoints.map((endpoint) =>
                renderEndpoint(endpoint)
              )
            ) : (
              <NoEndpointsFound />
            )}
          </div>
        )}
      </SchemaContext.Provider>
    </div>
  );
};

export default ApiReference;

const NoEndpointsFound = () => {
  return (
    <div className="py-8 text-center">
      <div className="bg-neutral-background-secondary border border-neutral-border-subtle/40 rounded-lg p-6">
        <h3 className="text-lg font-medium text-neutral-text mb-2">
          No API Endpoints Found
        </h3>
        <p className="text-neutral-text-secondary text-sm">
          This API schema doesn't contain any endpoints to display or the file
          is not found.
        </p>
      </div>
    </div>
  );
};
