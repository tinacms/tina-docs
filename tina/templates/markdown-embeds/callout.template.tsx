export const CalloutTemplate = {
  name: "Callout",
  label: "Callout",
  ui: {
    defaultItem: {
      body: "This is a callout",
      variant: "warning",
    },
  },
  fields: [
    {
      name: "body",
      label: "Body",
      type: "rich-text",
      isBody: true,
    },
    {
      name: "variant",
      label: "Variant",
      type: "string",
      options: ["warning", "info", "success", "error", "idea", "lock", "api"],
      defaultValue: "warning",
    },
  ],
};

export default CalloutTemplate;
