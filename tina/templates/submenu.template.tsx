import type { Template } from "tinacms";
import itemTemplate from "./toc-item.template";

const UIAndLabelling: any = {
  label: "Submenu",
  name: "items",
  ui: {
    itemProps: (item) => {
      return { label: `🗂️ ${item?.title ?? "Unnamed Menu Group"}` };
    },
  },
};

const thirdLevelSubmenu: Template = {
  ...UIAndLabelling,
  fields: [
    { name: "title", label: "Name", type: "string" },
    {
      name: "items",
      label: "Submenu Items",
      type: "object",
      list: true,
      templates: [itemTemplate],
    },
  ],
};

const secondLevelSubmenu: Template = {
  ...UIAndLabelling,
  fields: [
    { name: "title", label: "Name", type: "string" },
    {
      name: "items",
      label: "Submenu Items",
      type: "object",
      list: true,
      templates: [thirdLevelSubmenu, itemTemplate],
    },
  ],
};

export const submenuTemplate: Template = {
  ...UIAndLabelling,
  fields: [
    { name: "title", label: "Name", type: "string" },
    {
      name: "items",
      label: "Submenu Items",
      type: "object",
      list: true,
      templates: [secondLevelSubmenu, itemTemplate],
    },
  ],
};

export default submenuTemplate;
