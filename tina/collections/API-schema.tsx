import { wrapFieldsWithMeta } from "tinacms";
import { JsonFileUploadComponent } from "../customFields/file-upload";

export const API_Schema_Collection = {
  name: "apiSchema",
  label: "API Schema",
  path: "content/apiSchema",
  format: "json",

  fields: [
    {
      name: "apiSchema",
      label: "API Schema",
      type: "string",
      ui: { component: wrapFieldsWithMeta(JsonFileUploadComponent) },
    },
  ],
};

export default API_Schema_Collection;
