import MonacoCodeEditor from "@/tina/customFields/monaco-code-editor";

export const RecipeTemplate = {
  name: "recipe",
  label: "Code Accordion (Recipe)",
  fields: [
    {
      name: "title",
      label: "Heading Title",
      type: "string",
    },
    {
      name: "description",
      label: "Description",
      type: "string",
    },
    {
      type: "string",
      name: "code",
      label: "Code",
      ui: {
        component: MonacoCodeEditor,
        format: (val?: string) => val?.replaceAll("�", " "),
        parse: (val?: string) => val?.replaceAll(" ", "�"),
      },
    },
    {
      name: "instruction",
      label: "Instruction",
      type: "object",
      list: true,
      ui: {
        itemProps: (item) => {
          return { label: item?.header };
        },
      },
      fields: [
        {
          name: "header",
          label: "Header",
          type: "string",
        },
        {
          name: "itemDescription",
          label: "Item Description",
          type: "string",
        },
        {
          name: "codeLineStart",
          label: "Code Line Start",
          type: "number",
          description:
            "Enter negative values to highlight from 0 to your end number",
        },
        {
          name: "codeLineEnd",
          label: "Code Line End",
          type: "number",
          description:
            "Highlighting will not work if end number is greater than start number",
        },
      ],
    },
  ],
};

export default RecipeTemplate;
