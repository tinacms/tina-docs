"use client";

import { DocsNavigationList } from "./DocsNavigationList";

export const LeftHandSideParentContainer = ({
  tableOfContents,
  header,
}: {
  tableOfContents: any;
  header: any;
}) => {
  return (
    <div className="h-5/6 w-full rounded-2xl bg-white/50 shadow-xl">
      {header}
      {/* eslint-disable-next-line tailwindcss/no-arbitrary-value */}
      <div className="h-[76%] overflow-y-auto overflow-x-hidden pl-4 2xl:max-h-[75vh] 2xl:pl-0">
        <DocsNavigationList navItems={tableOfContents} />
      </div>
    </div>
  );
};
