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
    <div className="w-full h-full rounded-2xl brand-glass-gradient dark:border dark:border-neutral-border-subtle/60 shadow-xl">
      <div className="h-[calc(100vh-2rem)] overflow-y-auto overflow-x-hidden pl-4 2xl:pl-0">
        {typename?.includes("DocsTab") ? (
          <DocsNavigationItems
            navItems={tableOfContents.items}
            __typename={tableOfContents.__typename}
          />
        ) : typename?.includes("ApiTab") ? (
          <ApiNavigationItems
            navItems={tableOfContents.items}
            __typename={tableOfContents.__typename}
          />
        ) : null}
      </div>
    </div>
  );
};
