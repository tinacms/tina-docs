"use client";

import { DocsNavigationList } from "./DocsNavigationList";

export const LeftHandSideParentContainer = ({
  tableOfContents,
  globalSiteConfigTitle,
  globalSiteConfigColors,
  leftSidebarColors,
}: {
  tableOfContents: any;
  globalSiteConfigTitle: string;
  globalSiteConfigColors: any;
  leftSidebarColors: any;
}) => {
  return (
    <div
      className="rounded-2xl shadow-xl w-full h-5/6"
      style={{
        backgroundColor: `rgba(${parseInt(
          leftSidebarColors?.leftSidebarBackground?.slice(1, 3),
          16
        )}, 
                           ${parseInt(
                             leftSidebarColors?.leftSidebarBackground?.slice(
                               3,
                               5
                             ),
                             16
                           )}, 
                           ${parseInt(
                             leftSidebarColors?.leftSidebarBackground?.slice(
                               5,
                               7
                             ),
                             16
                           )}, 
                           ${leftSidebarColors?.backgroundOpacity ?? 1})`,
      }}
    >
      <h1
        className={`text-4xl pb-4 font-tuner pl-6 pt-6`}
        style={{
          backgroundImage: `linear-gradient(to bottom right, ${globalSiteConfigColors?.primaryColor?.primaryStart}, ${globalSiteConfigColors?.primaryColor?.primaryVia}, ${globalSiteConfigColors?.primaryColor?.primaryEnd})`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        {globalSiteConfigTitle || "TinaDocs"}
      </h1>

      <div className="overflow-y-scroll overflow-x-hidden h-[76%] 2xl:max-h-[75vh] pl-4 2xl:pl-0">
        <DocsNavigationList
          navItems={tableOfContents}
          lefthandSideColors={globalSiteConfigColors.leftHandSideNavigation}
        />
      </div>
    </div>
  );
};
