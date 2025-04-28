import type { Template } from "tinacms";
import { itemTemplate } from "./navbar-ui.template";

const createMenuTemplate = (templates: Template[]): Template => ({
  label: "Submenu",
  name: "items",
  ui: {
    itemProps: (item) => {
      return { label: `🗂️ ${item?.title ?? "Unnamed Menu Group"}` };
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

const thirdLevelSubmenu: Template = createMenuTemplate([itemTemplate]);
const secondLevelSubmenu: Template = createMenuTemplate([
  thirdLevelSubmenu,
  itemTemplate,
]);
export const submenuTemplate: Template = createMenuTemplate([
  secondLevelSubmenu,
  itemTemplate,
]);

export default submenuTemplate;
