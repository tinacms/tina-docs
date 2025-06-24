import { SchemaContext } from ".";
import { CodeBlock } from "../../standard-elements/code-block/code-block";
import { RequestBodyDropdown } from "./request-body-section";
import { ChevronIcon, SchemaType } from "./scheme-type";
import type {
  Endpoint,
  ExpandedResponsesState,
  ResponseViewState,
} from "./types";
import { generateExample } from "./utils";

export const ResponseBodySection = ({
  responses,
  endpoint,
  expandedResponses,
  setExpandedResponses,
  responseView,
  setResponseView,
  schemaDefinitions,
}: {
  responses: any;
  endpoint: Endpoint;
  expandedResponses: ExpandedResponsesState;
  setExpandedResponses: (state: ExpandedResponsesState) => void;
  responseView: ResponseViewState;
  setResponseView: (
    updater: (prev: ResponseViewState) => ResponseViewState
  ) => void;
  schemaDefinitions: any;
}) => {
  const nonErrorResponses = Object.entries(responses || {}).filter(
    ([code]) => !code.startsWith("4") && !code.startsWith("5")
  );

  if (nonErrorResponses.length === 0) {
    return (
      <div className="mb-8">
        <h4 className="text-xl text-neutral-text mb-2">Responses</h4>
        <div className="pl-3 text-neutral-text-secondary text-sm">
          No responses defined for this endpoint.
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h4 className="text-xl text-neutral-text mb-2">Responses</h4>
      <div className="space-y-4">
        {nonErrorResponses.map(([code, response]: [string, any]) => {
          const isErrorResponse = code.startsWith("4") || code.startsWith("5");
          const responseKey = `${endpoint.method}-${endpoint.path}-${code}`;
          const hasExpandableContent =
            response &&
            ((response.content && Object.keys(response.content).length > 0) ||
              response.schema ||
              (typeof response === "object" &&
                Object.keys(response).some((k) => k !== "description")));

          const view = responseView[responseKey] || "schema";
          const setView = (v: "schema" | "example") =>
            setResponseView((prev) => ({
              ...prev,
              [responseKey]: v,
            }));

          return (
            <div key={code}>
              <div
                className={`p-3 ${
                  hasExpandableContent ? "cursor-pointer" : ""
                }`}
                onClick={
                  hasExpandableContent
                    ? () => {
                        const newExpandedResponses = new Map(expandedResponses);
                        newExpandedResponses.set(
                          responseKey,
                          !expandedResponses.get(responseKey)
                        );
                        setExpandedResponses(newExpandedResponses);
                      }
                    : undefined
                }
                title={
                  hasExpandableContent ? "Click to expand/collapse" : undefined
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
                        isExpanded={expandedResponses.get(responseKey) || false}
                      />
                    )}
                  </div>
                  {hasExpandableContent && (
                    <div className="ml-auto relative">
                      <RequestBodyDropdown value={view} onChange={setView} />
                    </div>
                  )}
                </div>
              </div>
              {hasExpandableContent && expandedResponses.get(responseKey) && (
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
                              Object.keys(response.content).length > 0
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
  );
};
