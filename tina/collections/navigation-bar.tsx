import { getBearerAuthHeader } from "@/src/utils/tina/get-bearer-auth-header";
import { ApiReferencesSelector } from "../customFields/api-reference-selector";
import { itemTemplate } from "../templates/navbar-ui.template";
import submenuTemplate from "../templates/submenu.template";

const docsNavigationBarFields = [
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
];

const documentSubMenuTemplate = {
  name: "documentSubMenu",
  label: "Document Submenu",
  fields: [
    { name: "title", label: "Name", type: "string" },
    {
      name: "items",
      label: "Items",
      type: "object",
      list: true,
      templates: [itemTemplate],
    },
  ],
};

const groupOfApiReferencesTemplate = {
  name: "groupOfApiReferences",
  label: "Group of API References",
  fields: [
    {
      type: "string",
      name: "apiGroup",
      label: "API Group",
      ui: {
        component: ApiReferencesSelector,
      },
    },
  ],
};

const apiNavigationBarFields = [
  {
    name: "title",
    label: "title",
    type: "string",
  },
  {
    name: "supermenuGroup",
    label: "Supermenu Group",
    type: "object",
    list: true,
    templates: [documentSubMenuTemplate, groupOfApiReferencesTemplate],
  },
];

const docsTabTemplate = {
  name: "docsTab",
  label: "Docs Tab",
  fields: docsNavigationBarFields,
};

const apiTabTemplate = {
  name: "apiTab",
  label: "API Tab",
  fields: apiNavigationBarFields,
};

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
    beforeSubmit: async ({ values }: { values: Record<string, any> }) => {
      try {
        // Generate .mdx files for API endpoints when navigation is saved
        const response = await fetch("/api/process-api-docs", {
          method: "POST",
          headers: getBearerAuthHeader(),
          body: JSON.stringify({
            data: values,
          }),
        });

        if (response.ok) {
          const result = await response.json();
        } else {
          const error = await response.json();
          // Log error but don't block the save operation
        }

        // Always return the values, don't block the save operation if file generation fails
        return {
          ...values,
        };
      } catch (error) {
        // Don't block the save operation if file generation fails
        return {
          ...values,
        };
      }
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
      templates: [docsTabTemplate, apiTabTemplate],
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
