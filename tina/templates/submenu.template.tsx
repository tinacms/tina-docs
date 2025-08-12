import type { Template } from "tinacms";
import { itemTemplate } from "./navbar-ui.template";

const createMenuTemplate = (
  templates: Template[],
  level: number
): Template => ({
  label: "Submenu",
  name: "items",
  ui: {
    itemProps: (item) => {
      return { label: `🗂️ ${level} | ${item?.title ?? "Unnamed Menu Group"}` };
    },
  },
  fields: [
    { name: "title", label: "Name", type: "string" },
    {
      name: "items",
      label: "Submenu Items",
      type: "object",
      list: true,
      templates,
    },
  ],
});

const thirdLevelSubmenu: Template = createMenuTemplate([itemTemplate], 3);
const secondLevelSubmenu: Template = createMenuTemplate(
  [thirdLevelSubmenu, itemTemplate],
  2
);
export const submenuTemplate: Template = createMenuTemplate(
  [secondLevelSubmenu, itemTemplate],
  1
);

export default submenuTemplate;
