import React from "react";
import getGlobalSiteConfig from "../utils/getGlobalSiteConfig";

interface LayoutProps {
  children: React.ReactNode;
}

export async function SiteLayout({ children }: LayoutProps) {

  const globalSiteConfig = await getGlobalSiteConfig();

  const useCustomColor = globalSiteConfig?.customColorToggle?.disableColor === false;
  const customBackgroundColor = useCustomColor ? globalSiteConfig?.customColorToggle?.colorValue : '';

  return (
    <div
      className={`flex flex-col min-h-screen blob-bg font-sans bg-[length:100%_100%] bg-top bg-fixed ${useCustomColor ? '' : 'bg-blob-bg'}`}
      style={useCustomColor ? { backgroundColor: customBackgroundColor || undefined } : {}}
    >
      <div className="flex flex-col flex-1">{children}</div>
    </div>
  );
};
