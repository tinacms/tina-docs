import { CodeBlock } from "../../standard-elements/code-block/code-block";
import { SchemaType } from "./scheme-type";
import type { RequestBodyDropdownProps } from "./types";
import { generateExample } from "./utils";

export const RequestBodySection = ({
  requestBody,
  requestBodyView,
  setRequestBodyView,
  schemaDefinitions,
}: {
  requestBody: any;
  requestBodyView: "schema" | "example";
  setRequestBodyView: (view: "schema" | "example") => void;
  schemaDefinitions: any;
}) => {
  if (!requestBody) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between gap-2 mb-2">
        <h4 className="text-xl text-neutral-text">Request Body</h4>
        <RequestBodyDropdown
          value={requestBodyView}
          onChange={setRequestBodyView}
        />
      </div>
      {requestBody.description && (
        <p className="text-neutral-text mb-2">{requestBody.description}</p>
      )}
      <div>
        {requestBodyView === "schema" ? (
          <SchemaType
            schema={
              requestBody.content
                ? (Object.values(requestBody.content)[0] as any).schema
                : requestBody.schema
            }
            showExampleButton={false}
            isErrorSchema={false}
            name={(() => {
              const schema = requestBody.content
                ? (Object.values(requestBody.content)[0] as any).schema
                : requestBody.schema;
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
                requestBody.content
                  ? (Object.values(requestBody.content)[0] as any).schema
                  : requestBody.schema,
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
  );
};

export const RequestBodyDropdown = ({
  value,
  onChange,
}: RequestBodyDropdownProps) => {
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
