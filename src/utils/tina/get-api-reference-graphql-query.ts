import type { EndpointData } from "@/src/app/api/process-api-docs/types";
import { titleCase } from "title-case";

export const getApiReferenceGraphQLQuery = (
  endpoint: EndpointData,
  schema: string
) => {
  const { method, path, summary, description } = endpoint;

  const title = titleCase(summary) || `${method} ${path}`;
  const heading2 = "Endpoint Details";
  const heading3 = "API Reference";
  const processedDescription = description
    ?.replace(/\n/g, " ")
    .replace(/\{([^}]*)\}/g, "`{$1}`");
  const descriptionText =
    processedDescription || `API endpoint for ${method} ${path}`;
  const schemaProp = `${schema}|${method}:${path}`;

  return {
    title,
    seo: {
      title,
      description: descriptionText,
    },
    last_edited: new Date().toISOString(),
    body: {
      type: "root",
      children: [
        {
          type: "p",
          children: [
            {
              type: "text",
              text: processedDescription,
            },
          ],
        },
        {
          type: "h2",
          children: [{ type: "text", text: heading2 }],
        },
        {
          type: "p",
          children: [
            {
              type: "text",
              text: "Method:",
              bold: true,
            },
            { type: "text", text: " " },
            {
              type: "text",
              text: method,
              code: true,
            },
          ],
        },
        {
          type: "p",
          children: [{ type: "text", text: " " }],
        },
        {
          type: "p",
          children: [
            {
              type: "text",
              text: "Path:",
              bold: true,
            },
            { type: "text", text: " " },
            {
              type: "text",
              text: path,
              code: true,
            },
          ],
        },
        {
          type: "h2",
          children: [{ type: "text", text: heading3 }],
        },
        {
          type: "mdxJsxFlowElement",
          name: "apiReference",
          children: [{ type: "text", text: "" }],
          props: {
            schemaFile: schemaProp,
          },
        },
      ],
    },
  };
};
