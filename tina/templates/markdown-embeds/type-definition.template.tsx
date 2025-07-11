export const TypeDefinitionTemplate = {
  name: "typeDefinition",
  label: "Type Definition",
  fields: [
    {
      type: "object",
      name: "property",
      label: "Property",
      list: true,
      ui: {
        itemProps: (item) => {
          return {
            label: item.name,
          };
        },
      },
      fields: [
        {
          type: "string",
          name: "name",
          label: "Name",
        },
        {
          type: "rich-text",
          name: "description",
          label: "Description",
        },
        {
          type: "string",
          name: "type",
          label: "Type",
        },
        {
          type: "string",
          name: "typeUrl",
          label: "Type URL",
          description:
            "Turns the type into a link for further context. Useful for deeply nested types.",
        },
        {
          type: "boolean",
          name: "required",
          label: "Required",
        },
        {
          type: "boolean",
          name: "experimental",
          label: "Experimental",
        },
      ],
    },
  ],
};
