import { FileStructureField } from "@/tina/customFields/file-structure";

export const FileStructureTemplate = {
  name: "fileStructure",
  label: "File Structure",
  fields: [
    {
      type: "object",
      name: "fileStructure",
      label: "File Structure",
      ui: {
        component: FileStructureField,
      },
      list: true,
      fields: [
        {
          type: "string",
          name: "id",
          label: "ID",
        },
        {
          type: "string",
          name: "name",
          label: "Name",
        },
        {
          type: "string",
          name: "type",
          label: "Type",
        },
        {
          type: "string",
          name: "parentId",
          label: "Parent ID",
        },
      ],
    },
    {
      type: "string",
      name: "caption",
      label: "Caption",
      description: "Optional caption that appears under the component",
    },
  ],
};
