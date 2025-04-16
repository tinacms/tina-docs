export const apiReferenceTemplate = {
  name: "apiReference",
  label: "API Reference",
  fields: [
    {
      type: "string",
      name: "title",
      label: "Title",
    },
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

export default apiReferenceTemplate;
