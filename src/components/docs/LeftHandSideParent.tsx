"use client";

import { DocsNavigationList } from "./DocsNavigationList";

export const LeftHandSideParentContainer = ({
  tableOfContents,
}: {
  tableOfContents: any;
}) => {
  return (
    <div className="h-5/6 w-full rounded-2xl bg-white/50 shadow-xl">
      <h1
        className={
          "bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 bg-clip-text pb-4 pl-6 pt-6 font-tuner text-4xl text-transparent"
        }
      >
        TinaDocs
      </h1>
      <div className="h-[76%] overflow-x-hidden overflow-y-scroll pl-4 2xl:max-h-[75vh] 2xl:pl-0">
        <DocsNavigationList navItems={tableOfContents} />
      </div>
    </div>
  );
};
