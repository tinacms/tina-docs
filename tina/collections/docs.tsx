import AccordionTemplate, {
  AccordionBlockTemplate,
} from "@/tina/templates/markdown-embeds/accordion.template";
import { ApiReferenceTemplate } from "@/tina/templates/markdown-embeds/api-reference.template";
import CalloutTemplate from "@/tina/templates/markdown-embeds/callout.template";
import CardGridTemplate from "@/tina/templates/markdown-embeds/card-grid.template";
import CodeTabsTemplate from "@/tina/templates/markdown-embeds/code-tabs.template";
import { FileStructureTemplate } from "@/tina/templates/markdown-embeds/file-structure.template";
import RecipeTemplate from "@/tina/templates/markdown-embeds/recipe.template";
import ScrollShowcaseTemplate from "@/tina/templates/markdown-embeds/scroll-showcase.template";
import { TypeDefinitionTemplate } from "@/tina/templates/markdown-embeds/type-definition.template";
import YoutubeTemplate from "@/tina/templates/markdown-embeds/youtube.template";
import type { Template } from "tinacms";
import SeoInformation from "./seo-information";

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
        auto_generated: false,
      };
    },
    router: ({ document }) => {
      if (document._sys.filename === "index") {
        return "/";
      }
      const slug = document._sys.breadcrumbs.join("/");
      return `/docs/${slug}`;
    },
    filename: {
      slugify: (values) => {
        return (
          values?.title
            ?.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "") // Remove special characters except spaces and dashes
            .replace(/\s+/g, "-") // Replace spaces with dashes
            .replace(/-+/g, "-") // Replace multiple dashes with single dash
            .replace(/^-|-$/g, "") || // Remove leading/trailing dashes
          ""
        );
      },
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
      description: "Indicates if this document was automatically generated",
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
      type: "rich-text",
      name: "body",
      label: "Body",
      isBody: true,
      templates: [
        ScrollShowcaseTemplate as Template,
        CardGridTemplate as Template,
        RecipeTemplate as Template,
        AccordionTemplate as Template,
        AccordionBlockTemplate as Template,
        ApiReferenceTemplate as Template,
        YoutubeTemplate as Template,
        CodeTabsTemplate as Template,
        CalloutTemplate as Template,
        TypeDefinitionTemplate as Template,
        FileStructureTemplate as unknown as Template,
      ],
    },
  ],
};

export default docsCollection;
