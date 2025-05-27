"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import { DocsNavigationItems } from "./navigation-items";

export const NavigationSideBar = ({
  title,
  tableOfContents,
}: {
  title: string;
  tableOfContents: any;
}) => {
  const { resolvedTheme } = useTheme();
  return (
    <div className="w-full h-full rounded-2xl brand-glass-gradient border border-neutral-border-subtle shadow-xl">
      <div className="pl-6">
        <Image
          src={
            resolvedTheme === "dark"
              ? tableOfContents?.darkModeLogo
              : tableOfContents?.lightModeLogo
          }
          alt={
            resolvedTheme === "dark"
              ? tableOfContents?.darkModeLogo
              : tableOfContents?.lightModeLogo
          }
          width={200}
          height={200}
          className="py-6 h-full text-brand-primary"
        />
      </div>

      <div className="h-[calc(100%-230px)] overflow-y-auto overflow-x-hidden pl-4 2xl:pl-0">
        <DocsNavigationItems navItems={tableOfContents.items} />
      </div>
    </div>
  );
};
