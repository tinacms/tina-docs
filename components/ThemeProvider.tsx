// * ThemeUpdater is a client component that sets --backgroundColor at runtime */
"use client";

import { useEffect } from "react";
import getGlobalSiteConfig from "../utils/getGlobalSiteConfig";

export default function ThemeUpdater() {
  useEffect(() => {
    async function updateTheme() {
      const globalConfig = await getGlobalSiteConfig();
      if (
        globalConfig?.customColorToggle &&
        !globalConfig.customColorToggle.disableColor &&
        globalConfig.customColorToggle.colorValue
      ) {
        document.documentElement.style.setProperty(
          "--backgroundColor",
          globalConfig.customColorToggle.colorValue
        );
      }
    }
    updateTheme();
  }, []);
  
  return null;
}
