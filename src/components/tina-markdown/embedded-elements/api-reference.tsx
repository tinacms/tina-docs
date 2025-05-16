import React from "react";

export type ApiReferenceType = {
  endpointName: string;
  description: string;
  type: "GET" | "POST" | "PUT" | "DELETE";
  pathParameters: {
    parameterName: string;
    parameterDescription: string;
    required: boolean;
    in: "path" | "query" | "body";
    type: "string" | "number" | "boolean" | "integer";
  }[];
  responses: {
    status: number;
    description: string;
    responseBody: {
      fieldName: string;
      type: "string" | "number" | "integer" | "boolean" | "array" | "object";
      description: string;
      fields?: {
        fieldName: string;
        type: "string" | "number" | "integer" | "boolean" | "array" | "object";
        description: string;
      }[];
    }[];
  }[];
};

function Response({
  response,
}: {
  response: {
    status: number;
    description: string;
    responseBody: {
      fieldName: string;
      type: "string" | "number" | "integer" | "boolean" | "array" | "object";
      description: string;
      fields?: {
        fieldName: string;
        type: "string" | "number" | "integer" | "boolean" | "array" | "object";
        description: string;
      }[];
    }[];
  };
}) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className="flex flex-col gap-2 border border-neutral-border rounded-md p-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <span
            className={`font-bold text-base ${
              response.status >= 400
                ? "text-red-500"
                : response.status >= 300
                ? "text-amber-500"
                : "text-green-500"
            } bg-neutral-surface px-2 py-0.5 rounded-md`}
          >
            {response.status}
          </span>
          <span className="text-neutral-text">{response.description}</span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-brand-primary hover:text-brand-primary-hover"
        >
          {expanded ? "−" : "+"}
        </button>
      </div>

      {expanded && response.responseBody && (
        <div className="pl-4 flex flex-col gap-2 mt-2">
          {response.responseBody.map((field) => (
            <ResponseField key={field.fieldName} field={field} />
          ))}
        </div>
      )}
    </div>
  );
}

function ResponseField({
  field,
}: {
  field: {
    fieldName: string;
    type: "string" | "number" | "integer" | "boolean" | "array" | "object";
    description: string;
    fields?: {
      fieldName: string;
      type: "string" | "number" | "integer" | "boolean" | "array" | "object";
      description: string;
    }[];
  };
}) {
  const [expanded, setExpanded] = React.useState(false);
  const hasNestedFields = field.fields && field.fields.length > 0;

  return (
    <div className="flex flex-col gap-1 border-l-2 border-neutral-border pl-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <span className="font-bold text-sm text-neutral-text">
            {field.fieldName}
          </span>
          <span className="text-neutral-text brand-glass-gradient rounded-md shadow-sm font-mono text-xs py-0.5 px-2">
            {field.type}
          </span>
        </div>
        {hasNestedFields && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-brand-primary hover:text-brand-primary-hover text-sm"
          >
            {expanded ? "−" : "+"}
          </button>
        )}
      </div>
      <p className="text-neutral-text text-sm">{field.description}</p>

      {expanded && hasNestedFields && (
        <div className="pl-4 flex flex-col gap-1 mt-1">
          {field.fields!.map((subfield) => (
            <div
              key={subfield.fieldName}
              className="flex flex-col gap-0.5 border-l-2 border-neutral-border pl-3"
            >
              <div className="flex gap-2 items-center">
                <span className="font-bold text-sm text-neutral-text">
                  {subfield.fieldName}
                </span>
                <span className="text-neutral-text brand-glass-gradient rounded-md shadow-sm font-mono text-xs py-0.5 px-2">
                  {subfield.type}
                </span>
              </div>
              <p className="text-neutral-text text-sm">
                {subfield.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PathParameter({
  parameter,
}: {
  parameter: {
    parameterName: string;
    parameterDescription: string;
    required: boolean;
    in: "path" | "query" | "body";
    type: "string" | "number" | "boolean" | "integer";
  };
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 items-center">
        <span className="font-bold text-base text-neutral-text">
          {parameter?.parameterName}
        </span>
        <span className="text-neutral-text brand-glass-gradient rounded-md shadow-xl font-mono text-sm py-0.5 px-2">
          {" "}
          {parameter?.type}
        </span>
        <span className="text-neutral-text brand-glass-gradient rounded-md shadow-xl font-mono text-sm py-0.5 px-2">
          {" "}
          {parameter?.in}
        </span>
        {parameter?.required && (
          <span className="text-neutral-surface bg-brand-primary rounded-full shadow-xl font-mono text-sm py-0.5 px-2">
            {" "}
            Required
          </span>
        )}
      </div>
      {parameter?.parameterDescription && (
        <p className="text-neutral-text">{parameter?.parameterDescription}</p>
      )}
    </div>
  );
}

function StatusCode({ type }: { type: "GET" | "POST" | "PUT" | "DELETE" }) {
  return (
    <div className="flex items-center justify-center text-center bg-brand-tertiary rounded-md py-1 px-4 w-fit shadow-xl">
      <h3 className="text-brand-tertiary-text font-tuner pt-0.5">{type}</h3>
    </div>
  );
}

export default function ApiReference(data: ApiReferenceType) {
  console.log(data);
  return (
    <div>
      <h3 className="text-brand-primary text-3xl font-tuner py-1.5">
        {" "}
        Get Collection{" "}
      </h3>
      <div className="flex items-center text-center gap-2 py-1.5 ">
        <StatusCode type={data.type} />
        <span className="font-mono brand-glass-gradient px-1.5 pt-1.5 py-1 rounded-md shadow-xl text-neutral-text">
          {data.endpointName}
        </span>
      </div>
      <p className="text-neutral-text py-2">{data.description}</p>
      <h3 className="text-brand-primary text-3xl font-tuner py-1.5">
        {" "}
        Path Parameters{" "}
      </h3>
      <hr className="border-neutral-border py-1.5" />
      <div className="flex flex-col gap-4">
        {data.pathParameters.map((parameter) => (
          <PathParameter key={parameter.parameterName} parameter={parameter} />
        ))}
      </div>
      <h3 className="text-brand-primary text-3xl font-tuner py-3">
        {" "}
        Responses{" "}
      </h3>
      <hr className="border-neutral-border py-1.5" />
      <div className="flex flex-col gap-4">
        {data.responses.map((response) => (
          <Response key={response.status} response={response} />
        ))}
      </div>
    </div>
  );
}
