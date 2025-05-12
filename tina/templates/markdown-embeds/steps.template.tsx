export const StepsTemplate = {
  name: "steps",
  label: "Steps",
  ui: {
    defaultItem: {
      stepBlock: [
        {
          description: "This is the first step",
        },
        {
          description: "This is the second step",
        },
      ],
    },
  },
  fields: [
    {
      type: "object",
      name: "stepBlock",
      label: "Step Block",
      list: true,
      ui: {
        itemProps: (item) => {
          return {
            label: item.description.slice(0, 14) + "...",
          };
        },
        defaultItem: {
          description: "This is the x'th step",
        },
      },
      fields: [
        {
          type: "string",
          name: "description",
          label: "Description",
          ui: {
            component: "textarea",
          },
        },
      ],
    },
  ],
};
