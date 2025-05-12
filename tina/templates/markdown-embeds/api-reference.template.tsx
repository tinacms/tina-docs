//TODDO request body? 
export const ApiReferenceTemplate = {
  name: "apiReference",
  label: "API Reference",
  fields: [
    {
      name: "endpointName",
      label: "Endpoint Name",
      type: "string",
      description: "Such like /content/:collection",
    },
    {
      name: "description",
      label: "Description",
      type: "string",
    },
    {
      name: "type",
      label: "Type",
      type: "string",
      options: ["GET", "POST", "PUT", "DELETE"],
    },
    {
      name: "pathParameters",
      label: "Path Parameters",
      list: true,
      type: "object",
      fields: [
        { name: "parameterName", label: "Parameter Name", type: "string" },
        {
          name: "parameterDescription",
          label: "Parameter Description",
          type: "string",
          ui: {
            component: "textarea",
          },
        },
        {
          name: "required",
          label: "Required",
          type: "boolean",
        },
        {
          name: "in",
          label: "In",
          type: "string",
          options: ["path", "query", "body"],
        },
        {
          name: "type",
          label: "Type",
          type: "string",
          options: ["string", "number", "boolean", "integer"],
        },
      ],
    },
    {
      name: "responses",
      label: "Responses",
      list: true,
      type: "object",
      fields: [
        { name: "status", label: "Status Code", type: "number" },
        { name: "description", label: "Description", type: "string" },
        {
            name: "responseBody",
            label: "Response Body Schema",
            type: "object",
            list: true,
            fields: [
              { name: "fieldName", label: "Field Name", type: "string" },
              {
                name: "type",
                label: "Type",
                type: "string",
                options: ["string", "number", "integer", "boolean", "array", "object"]
              },
              { name: "description", label: "Description", type: "string" },
              {
                name: "fields",
                label: "Nested Fields (if type is object)",
                type: "object",
                list: true,
                fields: [
                  { name: "fieldName", label: "Field Name", type: "string" },
                  {
                    name: "type",
                    label: "Type",
                    type: "string",
                    options: ["string", "number", "integer", "boolean", "array", "object"]
                  },
                  { name: "description", label: "Description", type: "string" }
                ],
                ui: {
                  condition: (item) => item.type === "object"
                }
              }
            ]
          }
      ],
    },
  ],
};
