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
          type: "h1",
          children: [{ type: "text", text: title }],
        },
        ...(description
          ? [
              {
                type: "p",
                children: [{ type: "text", text: description }],
              },
            ]
          : []),
        {
          type: "heading",
          depth: 2,
          children: [{ type: "text", text: heading2 }],
        },
        {
          type: "p",
          children: [
            {
              type: "strong",
              children: [{ type: "text", text: "Method: " }],
            },
            {
              type: "inlineCode",
              value: method,
            },
          ],
        },
        {
          type: "p",
          children: [
            {
              type: "strong",
              children: [{ type: "text", text: "Path: " }],
            },
            {
              type: "inlineCode",
              value: path,
            },
          ],
        },
        {
          type: "heading",
          depth: 2,
          children: [{ type: "text", text: heading3 }],
        },
        {
          type: "component",
          name: "apiReference",
          props: {
            schemaFile: schemaProp,
          },
        },
      ],
    },
  };
};
