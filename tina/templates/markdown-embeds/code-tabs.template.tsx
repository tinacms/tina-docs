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
          language: "text",
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
          name: "language",
          label: "Code Highlighting Language",
          options: [
            {
              value: "text",
              label: "Plain Text",
            },
            {
              value: "javascript",
              label: "JavaScript",
            },
            {
              value: "typescript",
              label: "TypeScript",
            },
            {
              value: "python",
              label: "Python",
            },
            {
              value: "json",
              label: "JSON",
            },
            {
              value: "html",
              label: "HTML",
            },
            {
              value: "css",
              label: "CSS",
            },
            {
              value: "jsx",
              label: "JSX",
            },
            {
              value: "tsx",
              label: "TSX",
            },
            {
              value: "markdown",
              label: "Markdown",
            },
            {
              value: "shell",
              label: "Shell",
            },
            {
              value: "sql",
              label: "SQL",
            },
            {
              value: "graphql",
              label: "GraphQL",
            },
            {
              value: "java",
              label: "Java",
            },
            {
              value: "php",
              label: "PHP",
            },
            {
              value: "cpp",
              label: "C++",
            },
            {
              value: "yaml",
              label: "YAML",
            },
            {
              value: "xml",
              label: "XML",
            },
            {
              value: "scss",
              label: "SCSS",
            },
            {
              value: "vue",
              label: "Vue",
            },
            {
              value: "svelte",
              label: "Svelte",
            },
          ],
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
