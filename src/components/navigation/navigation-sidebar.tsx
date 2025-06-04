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
    <div className="overflow-y-auto overflow-x-hidden">
      {typename?.includes("DocsTab") ? (
        <DocsNavigationItems
          navItems={tableOfContents.items}
          __typename={tableOfContents.__typename}
        />
      ) : (
        <ApiNavigationItems
          navItems={tableOfContents.items}
          __typename={tableOfContents.__typename}
        />
      )}
    </div>
  );
};
