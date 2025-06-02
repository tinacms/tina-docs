"use client";

import { DocsNavigationItems } from "./navigation-items";

export const NavigationSideBar = ({
  tableOfContents,
}: {
  title: string;
  tableOfContents: any;
}) => {
  return (
    <div className="h-[calc(100vh-8rem)] overflow-y-auto overflow-x-hidden">
      <DocsNavigationItems navItems={tableOfContents.items} />
    </div>
  );
};
