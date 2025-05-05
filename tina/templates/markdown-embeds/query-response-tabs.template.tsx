import MonacoCodeEditor from "@/tina/customFields/monaco-code-editor";

export const QueryResponseTabsTemplate = {
  name: "queryResponseTabs",
  label: "Query Response Tabs",
  fields: [
    {
      type: "string",
      name: "code",
      label: "Code",
      ui: {
        component: MonacoCodeEditor,
      },
    },
    {
      type: "rich-text",
      name: "query",
      label: "Query",
    },
    {
      type: "rich-text",
      name: "response",
      label: "Response",
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

export default QueryResponseTabsTemplate;
