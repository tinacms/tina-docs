import type { Template } from "tinacms";

export const itemTemplate: Template = {
  label: "Item",
  name: "item",
  ui: {
    itemProps: (item) => {
      return { label: `🔗 ${item?.title ?? "Unnamed Menu Item"}` };
    },
  },
  fields: [
    { name: "title", label: "Name", type: "string" },
    { name: "slug", label: "Page", type: "reference", collections: ["docs"] },
  ],
};

export const submenusLabel: Pick<Template, "label" | "name" | "ui"> = {
  label: "Submenu",
  name: "items",
  ui: {
    itemProps: (item) => ({
      label: `🗂️ ${item?.title ?? "Unnamed Menu Group"}`,
    }),
  },
};
