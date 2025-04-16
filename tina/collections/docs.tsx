import accordionTemplate from "@/tina/templates/markdown-embeds/accordion.template";
import apiReferenceTemplate from "@/tina/templates/markdown-embeds/api-reference.template";
import cardGridTemplate from "@/tina/templates/markdown-embeds/card-grid.template";
import queryResponseTabsTemplate from "@/tina/templates/markdown-embeds/query-response-tabs.template";
import recipeTemplate from "@/tina/templates/markdown-embeds/recipe.template";
import scrollShowcaseTemplate from "@/tina/templates/markdown-embeds/scroll-showcase.template";
import { Template } from "tinacms";
import youtubeTemplate from "../templates/markdown-embeds/youtube.template";
import { seoInformation } from "./seoInformation";

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
        scrollShowcaseTemplate as Template,
        cardGridTemplate as Template,
        recipeTemplate as Template,
        accordionTemplate as Template,
        apiReferenceTemplate as Template,
        youtubeTemplate as Template,
        queryResponseTabsTemplate as Template,
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
