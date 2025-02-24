"use client";

import { DocsNavigationList } from "./DocsNavigationList";

export const LeftHandSideParentContainer = ({
  tableOfContents,
  globalSiteConfigTitle,
  globalSiteConfigColors,
  leftSidebarBackground,
}: {
  tableOfContents: any;
  globalSiteConfigTitle: string;
  globalSiteConfigColors: any;
  leftSidebarBackground: string;
}) => {

  
  return (
    <div
      className="rounded-2xl shadow-xl w-full h-5/6"
      style={{
        backgroundColor: leftSidebarBackground,
        // backgroundOpacity: 0.5,
      }}
    >
      <h1
        className={`text-4xl pb-4 font-tuner pl-6 pt-6`}
        style={{
          backgroundImage: `linear-gradient(to bottom right, ${globalSiteConfigColors?.primaryStart}, ${globalSiteConfigColors?.primaryVia}, ${globalSiteConfigColors?.primaryEnd})`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        {globalSiteConfigTitle || "TinaDocs"}
      </h1>

      <div className="overflow-y-scroll overflow-x-hidden h-[76%] 2xl:max-h-[75vh] pl-4 2xl:pl-0">
        <DocsNavigationList navItems={tableOfContents} />
      </div>
    </div>
  );
};
