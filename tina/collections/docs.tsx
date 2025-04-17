import AccordionTemplate from "@/tina/templates/markdown-embeds/accordion.template";
import ApiReferenceTemplate from "@/tina/templates/markdown-embeds/api-reference.template";
import CalloutTemplate from "@/tina/templates/markdown-embeds/callout.template";
import CardGridTemplate from "@/tina/templates/markdown-embeds/card-grid.template";
import QueryResponseTabsTemplate from "@/tina/templates/markdown-embeds/query-response-tabs.template";
import RecipeTemplate from "@/tina/templates/markdown-embeds/recipe.template";
import ScrollShowcaseTemplate from "@/tina/templates/markdown-embeds/scroll-showcase.template";
import YoutubeTemplate from "@/tina/templates/markdown-embeds/youtube.template";
import type { Template } from "tinacms";
import { seoInformation } from "./seo-information";

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
      toolbarOverride: [
        "heading",
        "link",
        "image",
        "quote",
        "ul",
        "ol",
        "bold",
        "italic",
        "code",
        "codeBlock",
        "mermaid",
        "table",
        "embed",
      ],
      isBody: true,
      templates: [
        ScrollShowcaseTemplate as Template,
        CardGridTemplate as Template,
        RecipeTemplate as Template,
        AccordionTemplate as Template,
        ApiReferenceTemplate as Template,
        YoutubeTemplate as Template,
        QueryResponseTabsTemplate as Template,
        CalloutTemplate as Template,
      ],
    },
  ],
};
