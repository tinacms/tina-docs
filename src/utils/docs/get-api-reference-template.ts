import type { EndpointData } from "@/src/app/api/create-api-docs-via-filesystem/route";

export const getApiReferenceTemplate = (
  endpoint: EndpointData,
  schema: string
) => {
  const { method, path, summary, description } = endpoint;

  const title = summary || `${method} ${path}`;
  const heading2 = "Endpoint Details";
  const heading3 = "API Reference";
  const descriptionText = description || `API endpoint for ${method} ${path}`;
  const schemaProp = `${schema}|${method}:${path}`;

  if (process.env.NODE_ENV === "development") {
    return `---
title: "${title}"
description: "${descriptionText}"
last_edited: "${new Date().toISOString()}"
---

${description ? `${description}\n` : ""}

## ${heading2}

**Method:** \`${method}\`  
**Path:** \`${path}\`

## ${heading3}

<apiReference schemaFile="${schemaProp}" />
`;
  }

  return {
    title,
    last_edited: new Date().toISOString(),
    seo: {
      title,
      description: descriptionText,
    },
    body: {
      type: "root",
      children: [
        {
          type: "h2",
          children: [{ type: "text", text: "Endpoint Details" }],
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
            { type: "text", text: "\n" },
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
          children: [{ type: "text", text: "API Reference" }],
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
