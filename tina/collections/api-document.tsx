import { ApiReferenceTemplate } from "../templates/markdown-embeds/api-reference.template";
import SeoInformation from "./seo-information";

export const apiDocumentCollection = {
  name: "apiDocumentation",
  label: "API Documentation",
  path: "content/docs/api-documentation",
  format: "mdx",
  ui: {
    beforeSubmit: async ({ values }) => {
      return {
        ...values,
        auto_generated: false,
      };
    },
  },

  fields: [
    SeoInformation,
    {
      name: "title",
      label: "Title",
      type: "string",
      isTitle: true,
      required: true,
    },
    {
      type: "string",
      name: "last_edited",
      label: "Last Edited",
      ui: {
        component: "hidden",
      },
    },
    {
      type: "boolean",
      name: "auto_generated",
      label: "Auto Generated",
      ui: {
        component: "hidden",
      },
    },
    {
      type: "rich-text",
      name: "body",
      label: "Body",
      isBody: true,
      templates: [
        ApiReferenceTemplate, // You can add templates here if needed for API documentation
      ],
    },
  ],
};
