"use client";

import { DocsNavigationItems } from "./navigation-items";

export const NavigationSideBar = ({
  tableOfContents,
}: {
  title: string;
  tableOfContents: any;
}) => {
  return (
    <div className="overflow-y-auto overflow-x-hidden">
      <DocsNavigationItems navItems={tableOfContents.items} />
    </div>
  );
};
