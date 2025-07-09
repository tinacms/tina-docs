import MonacoCodeEditor from "@/tina/customFields/monaco-code-editor";

export const QueryResponseTabsTemplate = {
  name: "queryResponseTabs",
  label: "Query Response Tabs",
  ui: {
    defaultItem: {
      query: "const CONTENT_MANAGEMENT = 'Optimized';",
      response: "const LLAMAS = '100';",
    },
  },
  fields: [
    {
      type: "string",
      name: "query",
      label: "Query",
      ui: {
        component: MonacoCodeEditor,
        format: (val?: string) => val?.replaceAll("�", " "),
        parse: (val?: string) => val?.replaceAll(" ", "�"),
      },
    },
    {
      type: "string",
      name: "response",
      label: "Response",
      ui: {
        component: MonacoCodeEditor,
        format: (val?: string) => val?.replaceAll("�", " "),
        parse: (val?: string) => val?.replaceAll(" ", "�"),
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

export default QueryResponseTabsTemplate;
