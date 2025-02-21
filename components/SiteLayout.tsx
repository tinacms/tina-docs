// SiteLayout.tsx (server component)
import React from "react";
import ThemeUpdater from "./ThemeProvider";
import getGlobalSiteConfig from "../utils/getGlobalSiteConfig";

interface LayoutProps {
  children: React.ReactNode;
}

export const SiteLayout = async ({ children }: LayoutProps) => {
  const globalConfig = await getGlobalSiteConfig();

  const useCustomBackground = !globalConfig?.customColorToggle?.disableColor;

  const backgroundClass = useCustomBackground
    ? "bg-[var(--backgroundColor)]"
    : "bg-blob-bg";


  return (
    <>
      
      <ThemeUpdater />
      <div
        className={`flex flex-col min-h-screen font-sans ${backgroundClass} bg-[length:100%_100%] bg-top bg-fixed`}
      >
        <div className="flex flex-col flex-1">{children}</div>
      </div>
    </>
  );
};
