import ItemTemplate from "../templates/toc-item.template";
import SubmenuTemplate from "../templates/toc-sub-item.template";

export const DocsTableOfContentsCollection = {
  name: "docsTableOfContents",
  label: "Docs - Table of Contents",
  path: "content/docs-toc",
  format: "json",
  ui: {
    allowedActions: {
      create: false,
      delete: false,
    },
  },
  fields: [
    {
      name: "supermenuGroup",
      label: "Supermenu Group",
      type: "object",
      list: true,
      ui: {
        itemProps: (item) => ({
          label: `🗂️ ${item?.title ?? "Unnamed Menu Group"}`,
        }),
      },
      fields: [
        { name: "title", label: "Name", type: "string" },
        {
          name: "items",
          label: "Page or Submenu",
          type: "object",
          list: true,
          templates: [SubmenuTemplate, ItemTemplate],
        },
      ],
    },
  ],
};

export default DocsTableOfContentsCollection;
