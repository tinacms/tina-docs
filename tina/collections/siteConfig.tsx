import React from "react";
import { Collection, wrapFieldsWithMeta } from "tinacms";
import { CustomColorToggle } from "../../components/ui/CustomColorToggle";

export const globalSiteConfiguration = {
  name: "globalSiteConfiguration",
  label: "Global Site Configuration",
  ui: {
    allowedActions: {
      create: false,
      delete: false,
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
      defaultItem: () => {
        return {
          primaryStart: "#f97316",
          primaryEnd: "#f97316",
          primaryVia: "#f97316",
        };
      },
      fields: [
        {
          name: "primaryColor",
          label: "Primary Color",
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
          name: "secondaryColor",
          label: "Secondary Color",
          type: "object",
          fields: [
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
          ],
        },
        {
          name: "pageToC",
          label: "Page ToC Colors",
          description:
            "This is for the color of the ToC on the right hand side of the page",
          type: "object",
          fields: [
            {
              name: "rightHandSideTitleColor",
              label: "Right Hand Side ToC Title Color",
              type: "string",
              ui: {
                component: "color",
                colorFormat: "hex",
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
          name: "leftHandSideNavigation",
          label: "Left Hand Side Navigation Colors",
          description: "This is for the colors of the left hand side navigation",
          type: "object",
          fields: [
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
            {
              label: "Background Opacity",
              name: "backgroundOpacity",
              type: "number",
              description: "This is the opacity of the left sidebar background",
              ui: {
                parse: (val) => Number(val),
            
                // wrapping our component in wrapFieldsWithMeta renders our label & description.
                component: wrapFieldsWithMeta(({ field, input, meta }) => {
                  return (
                    <div>
                      <input
                        id="backgroundOpacity"
                        type="range"
                        min="0"
                        max="1"
                        step=".1"
                        // This will pass along props.input.onChange to set our form values as this input changes.
                        {...input}
                      />
                      <br />
                      Value: {input.value}
                    </div>
                  )
                })
              }
            },
            {
              name: 'leftSidebarH1Color',
              label: 'Left Sidebar H1 Color',
              type: 'string',
              ui: {
                component: 'color',
                colorFormat: 'hex',
              },
            },
            {
              name: 'leftSidebarH2Color',
              label: 'Left Sidebar H2 Color',
              type: 'string',
              ui: {
                component: 'color',
                colorFormat: 'hex',
              },
            },
            {
              name: 'leftSidebarH3Color',
              label: 'Left Sidebar H3 Color',
              type: 'string',
              ui: {
                component: 'color', 
                colorFormat: 'hex',
              },
            },
          ],
        },
        {
          name: 'docsBodyStyling',
          label: 'Docs Body Styling',
          description: 'This is for the styling of the docs body',
          type: 'object',
          fields: [
            {
              name: 'docsBodyText',
              label: 'Docs Body Text Color',
              description: 'Text color for ordinary text',
              type: 'string',
              ui: {
                component: 'color',
                colorFormat: 'hex',
              },
            }
          ]
        }
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
