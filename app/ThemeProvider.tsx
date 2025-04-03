"use client";

import React, { useEffect } from "react";
import { client } from "../tina/__generated__/client";

type Props = {
  children?: React.ReactNode;
};

export const ThemeProvider = ({ children }: Props) => {
  useEffect(() => {
    const fetchTheme = async () => {
      const data = await client.queries.GlobalSiteColours({
        relativePath: "global-site-colors.mdx",
      });

      const theme = data?.data?.GlobalSiteColours;
      if (!theme) return;

      const getDefaultValue = (prop: string) =>
        document.documentElement.style.getPropertyValue(prop);

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
      };
      console.log("CSS Variables:", cssVars);

      Object.entries(cssVars).forEach(([prop, val]) =>
        document.documentElement.style.setProperty(prop, val as string)
      );
    };

    fetchTheme();
  }, []);

  return <>{children}</>;
};
