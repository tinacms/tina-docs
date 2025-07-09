import MonacoCodeEditor from "@/tina/customFields/monaco-code-editor";

export const CodeTabsTemplate = {
  name: "codeTabs",
  label: "Code Tabs",
  ui: {
    defaultItem: {
      tabs: [
        {
          name: "Query",
          content: "const CONTENT_MANAGEMENT = 'Optimized';",
        },
        {
          name: "Response",
          content: "const LLAMAS = '100';",
        },
      ],
      initialSelectedIndex: 0,
    },
  },
  fields: [
    {
      type: "object",
      name: "tabs",
      label: "Tabs",
      list: true,
      ui: {
        itemProps: (item) => ({
          label: `🗂️ ${item?.name ?? "Tab"}`,
        }),
        defaultItem: {
          name: "Tab",
          content: "const CONTENT_MANAGEMENT = 'Optimized';",
        },
      },
      fields: [
        {
          type: "string",
          name: "name",
          label: "Name",
        },
        {
          type: "string",
          name: "content",
          label: "Content",
          ui: {
            component: MonacoCodeEditor,
            format: (val?: string) => val?.replaceAll("�", " "),
            parse: (val?: string) => val?.replaceAll(" ", "�"),
          },
        },
      ],
    },
    {
      type: "number",
      name: "initialSelectedIndex",
      label: "Initial Selected Index",
      description:
        "The index of the tab to select by default, starting from 0.",
    },
  ],
};

export default CodeTabsTemplate;
