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

      console.log(data);
      const primaryStart =
        data?.data?.GlobalSiteColours?.primaryColour?.primaryStart;
      const primaryVia =
        data?.data?.GlobalSiteColours?.primaryColour?.primaryVia;
      const primaryEnd =
        data?.data?.GlobalSiteColours?.primaryColour?.primaryEnd;

      const secondaryStart =
        data?.data?.GlobalSiteColours?.secondaryColour?.secondaryStart;
      const secondaryVia =
        data?.data?.GlobalSiteColours?.secondaryColour?.secondaryVia;
      const secondaryEnd =
        data?.data?.GlobalSiteColours?.secondaryColour?.secondaryEnd;

      const backgroundType = data?.data?.GlobalSiteColours?.backgroundType;
      const backgroundImage = data?.data?.GlobalSiteColours?.background;
      const backgroundColor = data?.data?.GlobalSiteColours?.backgroundColor;

      //Setting Primary Colors
      document.documentElement.style.setProperty(
        "--primary-color-start",
        primaryStart || "--primary-color-start"
      );
      document.documentElement.style.setProperty(
        "--primary-color-via",
        primaryVia || "--primary-color-via"
      );
      document.documentElement.style.setProperty(
        "--primary-color-end",
        primaryEnd || "--primary-color-end"
      );

      //Setting Secondary Colors
      document.documentElement.style.setProperty(
        "--secondary-color-start",
        secondaryStart || "--secondary-color-start"
      );
      document.documentElement.style.setProperty(
        "--secondary-color-via",
        secondaryVia || "--secondary-color-via"
      );
      document.documentElement.style.setProperty(
        "--secondary-color-end",
        secondaryEnd || "--secondary-color-end"
      );

      //Setting background type
      document.documentElement.style.setProperty(
        "--default-background-type",
        backgroundType ||
          document.documentElement.style.getPropertyValue(
            "--default-background-type"
          )
      );

      //conditional, if background type is image, set background image, else set background color
      document.documentElement.style.setProperty(
        "--default-background",
        backgroundType === "image"
          ? backgroundImage
            ? `url(${backgroundImage})`
            : document.documentElement.style.getPropertyValue(
                "--default-background-image"
              )
          : backgroundColor ||
              document.documentElement.style.getPropertyValue(
                "--default-background-color"
              )
      );
    };

    fetchTheme();
  }, []);

  return <>{children}</>;
};
