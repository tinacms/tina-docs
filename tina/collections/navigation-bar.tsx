import { itemTemplate } from "../templates/navbar-ui.template";
import submenuTemplate from "../templates/submenu.template";

export const docsNavigationBarCollection = {
  name: "navigationBar",
  label: "Navigation Bar",
  path: "content/navigation-bar",
  format: "json",
  ui: {
    allowedActions: {
      create: false,
      delete: false,
    },
  },
  fields: [
    {
      name: "tabs",
      label: "Tabs",
      type: "object",
      list: true,
      ui: {
        itemProps: (item) => ({
          label: `🗂️ ${item?.title ?? "Unnamed Tab"}`,
        }),
      },
      fields: [
        {
          name: "title",
          label: "Tab Label",
          type: "string",
        },
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
              templates: [submenuTemplate, itemTemplate],
            },
          ],
        },
      ],
    },
  ],
};

export default docsNavigationBarCollection;
