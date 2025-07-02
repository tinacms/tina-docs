import { BROWSER_TAB_THEME_KEY } from "@/src/components/ui/theme-selector";
import React from "react";
import { RedirectItem } from "../customFields/redirect-item";

export const Settings = {
  name: "settings",
  label: "Settings",
  path: "content/settings",
  format: "json",
  ui: {
    global: true,
    allowedActions: {
      create: false,
      delete: false,
    },
    beforeSubmit: async ({ values }: { values: Record<string, any> }) => {
      sessionStorage.setItem(BROWSER_TAB_THEME_KEY, values.selectedTheme);
    },
  },
  fields: [
    {
      name: "title",
      label: "Title",
      type: "string",
    },
    {
      name: "description",
      label: "Description",
      type: "string",
    },
    {
      name: "seoDefaultTitle",
      label: "SEO Default Title",
      type: "string",
    },
    {
      name: "publisher",
      label: "Publisher",
      type: "string",
    },
    {
      name: "applicationName",
      label: "Application Name",
      type: "string",
    },
    {
      name: "siteUrl",
      label: "Site URL",
      type: "string",
    },
    {
      name: "roadmapUrl",
      label: "Roadmap URL",
      type: "string",
    },
    {
      name: "licenseUrl",
      label: "License URL",
      type: "string",
    },
    {
      name: "keywords",
      label: "Keywords",
      type: "string",
    },
    {
      name: "docsHomepage",
      label: "Docs Homepage",
      type: "string",
    },
    {
      name: "defaultOGImage",
      label: "Default OG Image",
      type: "image",
      uploadDir: () => "og",
    },
    {
      name: "social",
      label: "Social",
      type: "object",
      fields: [
        {
          name: "twitterHandle",
          label: "Twitter Handle",
          type: "string",
        },
        {
          name: "twitter",
          label: "Twitter",
          type: "string",
        },
        {
          name: "github",
          label: "GitHub",
          type: "string",
        },
        {
          name: "forum",
          label: "Forum",
          type: "string",
        },
      ],
    },
    {
      name: "selectedTheme",
      label: "Selected Theme",
      type: "string",
      ui: {
        component: "select",
      },
      options: [
        { label: "Default", value: "default" },
        { label: "Monochrome", value: "monochrome" },
        { label: "Blossom", value: "blossom" },
        { label: "Lake", value: "lake" },
        { label: "Pine", value: "pine" },
        { label: "Indigo", value: "indigo" },
      ],
    },
    {
      name: "redirects",
      label: "Redirects",
      type: "object",
      list: true,
      ui: {
        itemProps: (item) => {
          return {
            label:
              item.source && item.destination ? (
                <RedirectItem
                  source={item.source}
                  destination={item.destination}
                  permanent={item.permanent}
                />
              ) : (
                "Add Redirect"
              ),
          };
        },
      },
      fields: [
        {
          name: "source",
          label: "Source",
          type: "string",
          ui: {
            validate: (value) => {
              if (!value?.startsWith("/")) {
                return "Source path must start with /";
              }
            },
          },
        },
        {
          name: "destination",
          label: "Destination",
          type: "string",
          ui: {
            validate: (value) => {
              if (!value?.startsWith("/")) {
                return "Destination path must start with /";
              }
            },
          },
        },
        {
          name: "permanent",
          label: "Permanent",
          type: "boolean",
        },
      ],
    },
  ],
};
