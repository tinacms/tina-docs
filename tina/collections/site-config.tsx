import { CustomColorToggle } from "@/components/ui/CustomColorToggle";

export const GlobalSiteConfiguration = {
  name: "globalSiteConfiguration",
  label: "Global Site Configuration",
  ui: {
    global: true,
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
    {
      name: "errorConfig",
      label: "Error Config",
      type: "object",
      description:
        "This is the configuration for the 404 error page, you can add links to the error page to help the user navigate back to your website.",
      fields: [
        {
          name: "errorPageTitle",
          label: "Error Page Title",
          type: "string",
        },
        {
          name: "errorLinks",
          label: "Error Links",
          type: "object",
          list: true,
          fields: [
            {
              name: "linkText",
              label: "Link Text",
              type: "string",
            },
            {
              name: "linkUrl",
              label: "Link URL",
              type: "string",
            },
          ],
        },
      ],
    },
  ],
};

export default GlobalSiteConfiguration;
