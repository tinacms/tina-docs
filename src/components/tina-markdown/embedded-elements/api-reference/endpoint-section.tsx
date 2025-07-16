import { ErrorsSection } from "./error-section";
import { RequestBodySection } from "./request-body-section";
import { ResponseBodySection } from "./response-body-section";
import type {
  Endpoint,
  ExpandedResponsesState,
  ResponseViewState,
} from "./types";

export const EndpointSection = (
  endpoint: Endpoint,
  requestBodyView: "schema" | "example",
  setRequestBodyView: React.Dispatch<
    React.SetStateAction<"schema" | "example">
  >,
  expandedResponses: ExpandedResponsesState,
  setExpandedResponses: React.Dispatch<
    React.SetStateAction<ExpandedResponsesState>
  >,
  responseView: ResponseViewState,
  setResponseView: React.Dispatch<React.SetStateAction<ResponseViewState>>,
  schemaDefinitions: any
) => {
  return (
    <div
      key={endpoint.path + endpoint.method}
      className="mb-12 bg-neutral-background-secondary border border-neutral-border p-4 rounded-lg shadow-md"
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
