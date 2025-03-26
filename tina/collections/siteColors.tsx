export const globalSiteColours = {
  name: "GlobalSiteColours",
  label: "Global Site Colours",
  format: "mdx",
  path: "content/site-colors",
  ui: {
    allowedActions: {
      create: false,
      delete: false,
    },
  },
  fields: [
    {
      name: "primaryColour",
      label: "Primary Colour",
      type: "object",
      fields: [
        {
          name: "primaryStart",
          label: "Primary Start",
          type: "string",
          description:
            "If you do not wish to have 3 different colours, you can set the all three colours to be the same.",
          ui: {
            component: "color",
            colorFormat: "hex",
            widget: "sketch",
          },
        },
        {
          name: "primaryVia",
          label: "Primary Via",
          type: "string",
          ui: {
            component: "color",
            colorFormat: "hex",
            widget: "sketch",
          },
        },
        {
          name: "primaryEnd",
          label: "Primary End",
          type: "string",
          ui: {
            component: "color",
            colorFormat: "hex",
            widget: "sketch",
          },
        },
      ],
    },
    {
      name: "secondaryColour",
      label: "Secondary Colour",
      type: "object",
      fields: [
        {
          name: "secondaryStart",
          label: "Secondary Start",
          type: "string",
          ui: {
            component: "color",
            colorFormat: "hex",
            widget: "sketch",
          },
        },
        {
          name: "secondaryVia",
          label: "Secondary Via",
          type: "string",
          ui: {
            component: "color",
            colorFormat: "hex",
            widget: "sketch",
          },
        },
        {
          name: "secondaryEnd",
          label: "Secondary End",
          type: "string",
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
