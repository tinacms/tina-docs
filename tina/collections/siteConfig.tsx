import React from "react";
import { Collection } from "tinacms";
import { CustomColorToggle } from "../../components/ui/CustomColorToggle";

export const globalSiteConfiguration = {
  name: "globalSiteConfiguration",
  label: "Global Site Configuration",
  ui: {
    global: true,
    ui: {
      allowedActions: {
        create: false,
        delete: false,
      },
    },
  },
  path: "content/siteConfig",
  fields: [
    {
      name: "documentationSiteTitle",
      label: "Documentation Site Title",
      type: "string",
    },
    {
      name: "siteColors",
      label: "Site Colors",
      type: "object",
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
  ],
};
