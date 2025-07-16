import { client } from "@/tina/__generated__/client";
import { createContext, useCallback, useEffect, useState } from "react";
import { tinaField } from "tinacms/dist/react";
import { EndpointSection } from "./endpoint-section";
import type {
  ApiReferenceProps,
  Endpoint,
  ExpandedResponsesState,
  ResponseViewState,
  SchemaDetails,
} from "./types";
import { extractEndpoints, generateInitialExpandedState } from "./utils";

// Context to share schema definitions across components
export const SchemaContext = createContext<any>({});

export const ApiReference = (data: ApiReferenceProps) => {
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
      const endpoints: Endpoint[] = extractEndpoints(schemaJson);

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
      setExpandedResponses(
        generateInitialExpandedState(schemaDetails.endpoints)
      );
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

  const hasEndpoints =
    schemaDetails.endpoints && schemaDetails.endpoints.length > 0;

  return (
    <div
      className={`api-reference ${
        hasEndpoints ? "mb-12" : ""
      } transform transition-all duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
      data-tina-field={tinaField(data, "schemaFile")}
    >
      <SchemaContext.Provider value={schemaDefinitions}>
        {selectedEndpoint ? (
          // Show only the selected endpoint
          EndpointSection(
            selectedEndpoint,
            requestBodyView,
            setRequestBodyView,
            expandedResponses,
            setExpandedResponses,
            responseView,
            setResponseView,
            schemaDefinitions
          )
        ) : (
          // Show all endpoints
          <div>
            {hasEndpoints ? (
              schemaDetails.endpoints.map((endpoint) =>
                EndpointSection(
                  endpoint,
                  requestBodyView,
                  setRequestBodyView,
                  expandedResponses,
                  setExpandedResponses,
                  responseView,
                  setResponseView,
                  schemaDefinitions
                )
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
      <div className="bg-neutral-background-secondary border border-neutral-border/40 rounded-lg p-6">
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
    <div className="py-4">
      <div className="bg-red-50 rounded-md text-red-700 p-4">
        <h3 className="font-medium">Error</h3>
        <p>{error}</p>
      </div>
    </div>
  );
};
