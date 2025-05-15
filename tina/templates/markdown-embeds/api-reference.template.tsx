export const ApiReferenceTemplate = {
  name: "apiReference",
  label: "API Reference",
  ui: {
    defaultItem: {
      property: [
        {
          groupName: "Options",
          name: "format",
          type: "string",
          default: "table",
        },
        {
          groupName: "Options",
          name: "enableExperimental",
          type: "boolean",
          default: "false",
        },
        {
          name: "title",
          type: "string",
          default: "API Reference",
        },
        {
          name: "description",
          type: "string",
          default: "API Reference",
        },
      ],
    },
  },
  fields: [
    {
      type: "object",
      name: "property",
      label: "Property",
      list: true,
      ui: {
        itemProps: (item) => {
          return {
            label: item.groupName
              ? `📂 ${item.groupName} | ${item.name}`
              : item.name,
          };
        },
      },
      fields: [
        {
          type: "string",
          name: "groupName",
          label: "Group Name",
          description:
            "Adjacent properties with the same group name will be grouped together",
        },
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
          name: "default",
          label: "Default",
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

export default ApiReferenceTemplate;
