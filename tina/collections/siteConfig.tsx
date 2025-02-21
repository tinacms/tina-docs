import { Collection } from "tinacms";

export const globalSiteConfiguration = {
    name: "globalSiteConfiguration",
    label: "Global Site Configuration",
    ui: {
        global: true,
        ui: 
        {
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

    ]
}