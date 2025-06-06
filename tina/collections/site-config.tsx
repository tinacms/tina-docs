import { CustomColorToggle } from "@/components/ui/custom-color-toggle";

export const GlobalSiteConfiguration = {
  name: "globalSiteConfiguration",
  label: "Global Site Configuration",
  ui: {
    global: true,
    allowedActions: {
      create: false,
      delete: false,
    },
  },
  path: "content/site-config",
  format: "json",
  fields: [
    {
      name: "docsConfig",
      label: "Docs Config",
      type: "object",
      fields: [
        {
          name: "documentationSiteTitle",
          label: "Documentation Site Title",
          type: "string",
        },
      ],
    },
    {
      name: "colorScheme",
      label: "Color Scheme",
      type: "object",
      fields: [
        {
          name: "siteColors",
          label: "Site Colors",
          type: "object",
          defaultItem: () => {
            return {
              primaryStart: "#f97316",
              primaryEnd: "#f97316",
              primaryVia: "#f97316",
            };
          },
          fields: [
            {
              name: "primaryStart",
              label: "Primary Color | Gradient Start",
              type: "string",
              description:
                "This is the start of the primary color gradient ⚠️ If you want a solid color leave the end and via empty ⚠️",
              ui: {
                component: "color",
                colorFormat: "hex",
                widget: "sketch",
              },
            },
            {
              name: "primaryEnd",
              label: "Primary Color | Gradient End",
              type: "string",
              ui: {
                component: "color",
                colorFormat: "hex",
                widget: "sketch",
              },
            },
            {
              name: "primaryVia",
              label: "Primary Color | Gradient Via",
              type: "string",
              ui: {
                component: "color",
                colorFormat: "hex",
                widget: "sketch",
              },
            },
            {
              name: "secondaryStart",
              label: "Secondary Color | Gradient Start",
              type: "string",
              description:
                "This is the start of the secondary color gradient ⚠️ If you want a solid color leave the end and via empty ⚠️",
              ui: {
                component: "color",
                colorFormat: "hex",
                widget: "sketch",
              },
            },
            {
              name: "secondaryEnd",
              label: "Secondary Color | Gradient End",
              type: "string",
              ui: {
                component: "color",
                colorFormat: "hex",
                widget: "sketch",
              },
            },
            {
              name: "secondaryVia",
              label: "Secondary Color | Gradient Via",
              type: "string",
              ui: {
                component: "color",
                colorFormat: "hex",
                widget: "sketch",
              },
            },
            {
              name: "rightHandSideActiveColor",
              label: "Right Hand Side ToC Active Color",
              type: "string",
              ui: {
                component: "color",
                colorFormat: "hex",
              },
            },
            {
              name: "rightHandSideInactiveColor",
              label: "Right Hand Side ToC Inactive Color",
              type: "string",
              ui: {
                component: "color",
                colorFormat: "hex",
              },
            },
          ],
        },

        {
          name: "customColorToggle",
          label: "Custom Color Toggle",
          type: "object",
          fields: [
            {
              name: "disableColor",
              label: "Tick to use Default Background Color",
              type: "boolean",
            },
            {
              name: "colorValue",
              label: "Color Value",
              type: "string",
            },
          ],
          ui: {
            component: CustomColorToggle,
          },
        },
        {
          name: "leftSidebarBackground",
          label: "Left Sidebar Background",
          type: "string",
          description: "This is the background color of the left sidebar",
          ui: {
            component: "color",
            colorFormat: "hex",
            widget: "sketch",
          },
        },
      ],
    },
  ],
};

export default GlobalSiteConfiguration;
