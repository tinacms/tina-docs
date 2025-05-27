"use client";

import { DocsNavigationItems } from "./navigation-items";

export const NavigationSideBar = ({
  tableOfContents,
}: {
  title: string;
  tableOfContents: any;
}) => {
  return (
    <div className="w-full h-full rounded-2xl brand-glass-gradient dark:border dark:border-neutral-border-subtle/60 shadow-xl">
      <div className="h-[calc(100vh-2rem)] overflow-y-auto overflow-x-hidden pl-4 2xl:pl-0">
        <DocsNavigationItems navItems={tableOfContents.items} />
      </div>
    </div>
  );
};
