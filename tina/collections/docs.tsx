import { seoInformation } from "./seoInformation";
import { Template } from "tinacms";
import { CardGridSchema } from "@/components/tinaMarkdown/CardGrid.schema";
import ScrollBasedShowcase from "@/components/tinaMarkdown/scrollBasedShowcase.schema";
import { RecipeBlock } from "@/components/tinaMarkdown/Recipe.template";

export const docsCollection = {
  name: "docs",
  label: "Docs",
  path: "content/docs",
  format: "mdx",
  ui: {
    beforeSubmit: async ({ values }) => {
      return {
        ...values,
        last_edited: new Date().toISOString(),
      };
    },
    router: ({ document }) => {
      if (document._sys.filename === "index") {
        return "/";
      }
      const slug = document._sys.breadcrumbs.join("/");
      return `/docs/${slug}`;
    },
  },
  fields: [
    seoInformation,
    {
      name: "title",
      label: "Title",
      type: "string",
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
      name: "tocIsHidden",
      label: "Hide Table of Contents",
      description:
        "Hide the Table of Contents on this page and expand the content window.",
    },
    {
      name: "next",
      label: "Next page",
      type: "reference",
      collections: ["docs"],
    },
    {
      name: "previous",
      label: "Previous page",
      type: "reference",
      collections: ["docs"],
    },
    {
      type: "rich-text",
      name: "body",
      label: "Body",
      isBody: true,
      templates: [
        ScrollBasedShowcase as Template,
        CardGridSchema,
        RecipeBlock as Template,
        {
          name: "apiReference",
          label: "API Reference",
          fields: [
            {
              type: "string",
              name: "title",
              label: "Title",
            },
            {
              type: "object",
              name: "property",
              label: "Property",
              list: true,
              ui: {
                itemProps: (item) => {
                  return {
                    label: item.groupName
                      ? `📂 ${item.groupName} | ${item.name}`
                      : item.name,
                  };
                },
              },
              fields: [
                {
                  type: "string",
                  name: "groupName",
                  label: "Group Name",
                  description:
                    "Adjacent properties with the same group name will be grouped together",
                },
                {
                  type: "string",
                  name: "name",
                  label: "Name",
                },
                {
                  type: "rich-text",
                  name: "description",
                  label: "Description",
                },
                {
                  type: "string",
                  name: "type",
                  label: "Type",
                },
                {
                  type: "string",
                  name: "default",
                  label: "Default",
                },
                {
                  type: "boolean",
                  name: "required",
                  label: "Required",
                },
                {
                  type: "boolean",
                  name: "experimental",
                  label: "Experimental",
                },
              ],
            },
          ],
        },
        {
          name: "Youtube",
          label: "Youtube Embed",
          fields: [
            {
              type: "string",
              name: "embedSrc",
              label: "Embed URL",
              description:
                "⚠︎ Only YouTube embed URLs work - they look like this https://www.youtube.com/embed/Yoh2c5RUTiY",
            },
            {
              type: "string",
              name: "caption",
              label: "Caption",
              description: "The caption of the video",
            },
            {
              type: "string",
              name: "minutes",
              label: "Minutes",
              description: "The duration of the video in minutes",
            },
          ],
        },
        {
          name: "GraphQLCodeBlock",
          label: "GraphQL Code Block",
          fields: [
            {
              type: "string",
              name: "query",
              label: "Query",
              description:
                "Paste GraphQL query here. \"#\" are auto-inserted as spacing placeholders and should not be used.",
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
                "Paste GraphQL response data here. \"#\" are auto-inserted as spacing placeholders and should not be used.",
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
        },
        {
          name: "WarningCallout",
          label: "Warning Callout",
          fields: [
            {
              name: "body",
              label: "Body",
              type: "rich-text",
            },
          ],
        },
        {
          name: "Iframe",
          label: "Embeded an Iframe",
          fields: [
            { name: "iframeSrc", type: "string" },
            {
              name: "height",
              type: "number",
              label: "Height",
              description: "The hight of the iframe (in px) ",
            },
          ],
        },
        {
          name: "CloudinaryVideo",
          label: "Cloudinary Video",
          fields: [
            {
              type: "string",
              name: "src",
              label: "Cloudinary URL",
              description: "Full URL with no file extension",
            },
          ],
        },
        {
          name: "WebmEmbed",
          label: "Webm Embed",
          fields: [
            {
              type: "string",
              name: "embedSrc",
              label: "Embed SRC",
            },
            {
              type: "string",
              name: "width",
              label: "width",
            },
          ],
        },
        {
          name: "ImageAndText",
          label: "Image and Text",
          fields: [
            {
              name: "heading",
              label: "Heading",
              type: "string",
              description:
                "The heading text that will be displayed in the collapsed state",
            },
            {
              name: "docText",
              label: "docText",
              isBody: true,
              type: "rich-text",
            },
            {
              name: "image",
              label: "image",
              type: "image",
            },
          ],
        },
        {
          name: "SummaryTab",
          label: "Summary Tab",
          fields: [
            {
              name: "heading",
              label: "Heading",
              type: "string",
              description:
                "DO NOT USE THIS TEMPLATE WHILST YOU SEE THIS MESSAGE //TODO: #1967",
            },
            {
              name: "text",
              label: "text",
              isBody: true,
              type: "rich-text",
            },
          ],
        },
      ],
    },
  ],
};
