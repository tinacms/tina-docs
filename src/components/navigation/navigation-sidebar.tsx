"use client";

import { Search } from "../search-docs/search";
import LightDarkSwitch from "../ui/light-dark-switch";
import { DocsNavigationItems } from "./navigation-items";
import Image from "next/image";

export const NavigationSideBar = ({
  tableOfContents,
}: {
  tableOfContents: any;
}) => {
  return (
    <div className="w-full h-full rounded-2xl brand-glass-gradient border border-neutral-border-subtle shadow-xl">
      <div className="flex-col pl-6 items-center">
        <Image src={tableOfContents?.title} alt={tableOfContents?.title} width={200} height={200} className='py-6 text-brand-primary'/>
        <LightDarkSwitch />
        <Search />
      </div>

      <div className="overflow-y-auto overflow-x-hidden pl-4 2xl:max-h-[75vh] 2xl:pl-0">
        <DocsNavigationItems navItems={tableOfContents.items} />
      </div>
    </div>
  );
};

