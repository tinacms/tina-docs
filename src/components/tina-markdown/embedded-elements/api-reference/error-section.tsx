import { SchemaContext } from ".";
import { CodeBlock } from "../../standard-elements/code-block/code-block";
import { RequestBodyDropdown } from "./request-body-section";
import { SchemaType } from "./scheme-type";
import type {
  Endpoint,
  ExpandedResponsesState,
  ResponseViewState,
} from "./types";
import { generateExample } from "./utils";

export const ErrorsSection = ({
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
  const hasErrors = Object.entries(responses || {}).some(
    ([code]) => code.startsWith("4") || code.startsWith("5")
  );

  if (!hasErrors) return null;

  return (
    <div className="mb-8">
      <h4 className="text-xl text-neutral-text mb-2">Errors</h4>
      <div>
        {Object.entries(responses || {})
          .filter(([code]) => code.startsWith("4") || code.startsWith("5"))
          .map(([code, response]: [string, any], index: number) => {
            const isErrorResponse = true;
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
                        <RequestBodyDropdown value={view} onChange={setView} />
                        <span
                          className="ml-auto text-2xl font-bold select-none pointer-events-none flex items-center"
                          style={{ minWidth: 28 }}
                        >
                          {expandedResponses.get(responseKey) ? "−" : "+"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {hasExpandableContent && expandedResponses.get(responseKey) && (
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
