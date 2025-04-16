export const queryResponseTabsTemplate = {
  name: "queryResponseTabs",
  label: "Query Response Tabs",
  fields: [
    {
      type: "string",
      name: "query",
      label: "Query",
      description:
        "Paste GraphQL query here. '#' are auto-inserted as spacing placeholders and should not be used.",
      ui: {
        /* TODO - remove as per https://github.com/tinacms/tina.io/issues/2047 */
        component: "textarea",
        format: (val?: string) => val && val.replaceAll("#", " "),
        parse: (val?: string) => val && val.replaceAll(" ", "#"),
      },
    },
    {
      type: "string",
      name: "response",
      label: "Response",
      description:
        "Paste GraphQL response data here. '#' are auto-inserted as spacing placeholders and should not be used.",
      ui: {
        /* TODO - remove as per https://github.com/tinacms/tina.io/issues/2047 */
        component: "textarea",
        format: (val?: string) => val && val.replaceAll("#", " "),
        parse: (val?: string) => val && val.replaceAll(" ", "#"),
      },
    },
    {
      type: "boolean",
      name: "preselectResponse",
      label: "Select Response by Default",
      description: "Select the response tab by default",
    },
    {
      type: "string",
      name: "customQueryName",
      label: "Custom Query Name",
      description: "Replaces 'Query' in the tab name",
    },
    {
      type: "string",
      name: "customResponseName",
      label: "Custom Response Name",
      description: "Replaces 'Response' in the tab name",
    },
  ],
};

export default queryResponseTabsTemplate;
