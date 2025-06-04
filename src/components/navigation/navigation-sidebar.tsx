"use client";

import { DocsNavigationItems } from "./navigation-items";
import { ApiNavigationItems } from "./navigation-items";

export const NavigationSideBar = ({
  tableOfContents,
}: {
  tableOfContents: any;
}) => {
  const typename = tableOfContents.__typename;

  return (
    <div className="h-[calc(100vh-8rem)] overflow-y-auto overflow-x-hidden">
      <DocsNavigationItems navItems={tableOfContents.items} />
    </div>
  );
};
