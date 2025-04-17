import type { Template } from "tinacms";
import { ItemTemplate } from "./toc-item.template";

const UIAndLabelling: any = {
  label: "Submenu",
  name: "items",
  ui: {
    itemProps: (item) => {
      return { label: `🗂️ ${item?.title ?? "Unnamed Menu Group"}` };
    },
  },
};

const ThirdLevelSubmenu: Template = {
  ...UIAndLabelling,
  fields: [
    { name: "title", label: "Name", type: "string" },
    {
      name: "items",
      label: "Submenu Items",
      type: "object",
      list: true,
      templates: [ItemTemplate],
    },
  ],
};

const SecondLevelSubmenu: Template = {
  ...UIAndLabelling,
  fields: [
    { name: "title", label: "Name", type: "string" },
    {
      name: "items",
      label: "Submenu Items",
      type: "object",
      list: true,
      templates: [ThirdLevelSubmenu, ItemTemplate],
    },
  ],
};

export const SubmenuTemplate: Template = {
  ...UIAndLabelling,
  fields: [
    { name: "title", label: "Name", type: "string" },
    {
      name: "items",
      label: "Submenu Items",
      type: "object",
      list: true,
      templates: [SecondLevelSubmenu, ItemTemplate],
    },
  ],
};

export default SubmenuTemplate;