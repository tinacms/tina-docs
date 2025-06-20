import { client } from "@/tina/__generated__/client";
// biome-ignore lint/style/useImportType:
import React, { useEffect, useState, createContext, useCallback } from "react";
import { ErrorsSection } from "./error-section";
import { RequestBodySection } from "./request-body-section";
import { ResponseBodySection } from "./response-body-section";
import type {
  ApiReferenceProps,
  Endpoint,
  ExpandedResponsesState,
  ResponseViewState,
  SchemaDetails,
} from "./types";

// Context to share schema definitions across components
export const SchemaContext = createContext<any>({});

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

  // Function to process schema data and extract endpoints
  const processSchemaData = useCallback(
    (schemaJson: any, endpointSelector: string) => {
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
    },
    []
  );

  useEffect(() => {
    if (!loading && schemaDetails) {
      // Force a reflow to ensure the animation triggers
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    }
  }, [loading, schemaDetails]);

  const resetState = useCallback(() => {
    setLoading(true);
    setError(null);
    setSchemaDetails(null);
    setSelectedEndpoint(null);
    setSchemaDefinitions({});
    setExpandedResponses(new Map());
    setResponseView({});
    setIsVisible(false);
  }, []);

  useEffect(() => {
    const fetchAndParseSchema = async () => {
      try {
        resetState();

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

        // Process the schema data
        processSchemaData(schemaJson, endpointSelector);

        setLoading(false);
      } catch (error) {
        setError("An error occurred while loading the API schema");
        setLoading(false);
      }
    };

    fetchAndParseSchema();
  }, [data.schemaFile, resetState, setEmptySchema, processSchemaData]);

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
    return <Loading />;
  }

  if (error) {
    return <ErrorMessage error={error} />;
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
        <Header endpoint={endpoint} />
        <>
          {/* Parameters section - only show if there are non-body parameters */}
          {endpoint.parameters && endpoint.parameters.length > 0 && (
            <ParametersSection parameters={endpoint.parameters} />
          )}

          {/* Request Body section */}
          {endpoint.requestBody && (
            <RequestBodySection
              requestBody={endpoint.requestBody}
              requestBodyView={requestBodyView}
              setRequestBodyView={setRequestBodyView}
              schemaDefinitions={schemaDefinitions}
            />
          )}

          {/* Responses section */}
          <ResponseBodySection
            responses={endpoint.responses}
            endpoint={endpoint}
            expandedResponses={expandedResponses}
            setExpandedResponses={setExpandedResponses}
            responseView={responseView}
            setResponseView={setResponseView}
            schemaDefinitions={schemaDefinitions}
          />

          {/* Errors section for 4XX and 5XX */}
          {Object.entries(endpoint.responses || {}).some(
            ([code]) => code.startsWith("4") || code.startsWith("5")
          ) && (
            <ErrorsSection
              responses={endpoint.responses}
              endpoint={endpoint}
              expandedResponses={expandedResponses}
              setExpandedResponses={setExpandedResponses}
              responseView={responseView}
              setResponseView={setResponseView}
              schemaDefinitions={schemaDefinitions}
            />
          )}
        </>
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

const Loading = () => {
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
};

const ErrorMessage = ({ error }: { error: string }) => {
  return (
    <div className="p-4">
      <div className="bg-red-50 rounded-md text-red-700">
        <h3 className="font-medium">Error</h3>
        <p>{error}</p>
      </div>
    </div>
  );
};

const Header = ({ endpoint }: { endpoint: Endpoint }) => {
  return (
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
  );
};

const ParametersSection = ({ parameters }: { parameters: any[] }) => {
  if (!parameters || parameters.length === 0) return null;

  return (
    <div className="mb-8">
      <h4 className="text-xl text-neutral-text mb-2">Path Parameters</h4>
      <div className="space-y-4 pl-3">
        {parameters.map((param: any, index: number) => (
          <div key={index}>
            <div className="flex items-center mb-2">
              <span className="text-neutral-text mr-2">{param.name}</span>
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
  );
};

export default ApiReference;
