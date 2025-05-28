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
      name: "lightModeLogo",
      label: "Light Mode Logo",
      type: "image",
    },
    {
      name: "darkModeLogo",
      label: "Dark Mode Logo",
      type: "image",
      description: "If your light mode logo fits dark-mode, leave this blank.",
    },
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
          label: "Title Label",
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
    {
      name: "ctaButtons",
      label: "CTA Buttons",
      type: "object",
      fields: [
        {
          name: "button1",
          label: "Button 1",
          type: "object",
          fields: [
            { label: "Label", name: "label", type: "string" },
            { label: "Link", name: "link", type: "string" },
            {
              label: "variant",
              name: "variant",
              type: "string",
              options: [
                "primary-background",
                "secondary-background",
                "primary-outline",
                "secondary-outline",
              ],
            },
          ],
        },
        {
          name: "button2",
          label: "Button 2",
          type: "object",
          fields: [
            { label: "Label", name: "label", type: "string" },
            { label: "Link", name: "link", type: "string" },
            {
              label: "variant",
              name: "variant",
              type: "string",
              options: [
                "primary-background",
                "secondary-background",
                "primary-outline",
                "secondary-outline",
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default docsNavigationBarCollection;
