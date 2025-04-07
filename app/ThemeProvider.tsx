"use client";

import React, { useEffect } from "react";
import { client } from "../tina/__generated__/client";

type Props = {
  children?: React.ReactNode;
};

// Utility function to merge Tailwind classes
export const cn = (...classes: (string | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};

export const ThemeProvider = ({ children }: Props) => {
  useEffect(() => {
    const fetchTheme = async () => {
      const data = await client.queries.GlobalSiteColours({
        relativePath: "global-site-colors.mdx",
      });

      const theme = data?.data?.GlobalSiteColours;
      if (!theme) return;

      // Handle background settings
      let backgroundImage = "";
      let backgroundColor = "";

      switch (theme.backgroundType) {
        case "default":
          backgroundImage = 'url("/svg/default-background.svg")';
          backgroundColor = "#FFFFFF";
          break;
        case "image":
          backgroundImage = theme.backgroundImage
            ? `url("${theme.backgroundImage}")`
            : "";
          break;
        case "color":
          backgroundColor = theme.backgroundColor || "#FFFFFF";
          break;
      }

      const cssVars = {
        //Setting Primary Colors
        "--primary-color-start":
          theme.primaryColour?.primaryStart || "--primary-color-start",
        "--primary-color-via":
          theme.primaryColour?.primaryVia || "--primary-color-via",
        "--primary-color-end":
          theme.primaryColour?.primaryEnd || "--primary-color-end",
        //Setting Secondary Colors
        "--secondary-color-start":
          theme.secondaryColour?.secondaryStart || "--secondary-color-start",
        "--secondary-color-via":
          theme.secondaryColour?.secondaryVia || "--secondary-color-via",
        "--secondary-color-end":
          theme.secondaryColour?.secondaryEnd || "--secondary-color-end",
        //Setting Background
        "--background-image": backgroundImage,
        "--background-color": backgroundColor,
        //Setting Text Color
        "--text-color": theme.textColor || "#374151", // Default to a dark gray if not set
      };

      Object.entries(cssVars).forEach(([prop, val]) =>
        document.documentElement.style.setProperty(prop, val as string)
      );
    };

    fetchTheme();
  }, []);

  return <>{children}</>;
};
