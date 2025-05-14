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
  return <div></div>;
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
