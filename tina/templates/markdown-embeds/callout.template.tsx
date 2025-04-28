export const CalloutTemplate = {
  name: "Callout",
  label: "Callout",
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
      options: ["warning", "info", "success", "error", "idea", "lock"],
      defaultValue: "warning",
    },
  ],
};

export default CalloutTemplate;