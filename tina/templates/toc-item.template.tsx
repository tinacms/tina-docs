import type { Template } from "tinacms";

export const ItemTemplate: Template = {
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

export default ItemTemplate;