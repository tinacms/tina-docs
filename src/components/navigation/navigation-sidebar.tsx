"use client";

import LightDarkSwitch from "../ui/light-dark-switch";
import { DocsNavigationItems } from "./navigation-items";

export const NavigationSideBar = ({
  tableOfContents,
}: {
  tableOfContents: any;
}) => {
  return (
    <div className="w-full h-full rounded-2xl brand-glass-gradient border border-neutral-border-subtle shadow-xl">
      <div className="flex-col pl-6 items-center">
        <Title title={tableOfContents?.title} />
        <LightDarkSwitch />
      </div>

      <div className="overflow-y-auto overflow-x-hidden pl-4 2xl:max-h-[75vh] 2xl:pl-0">
        <DocsNavigationItems navItems={tableOfContents.items} />
      </div>
    </div>
  );
};

const Title = ({ title }: { title: string }) => (
  <div className="">
    <h1 className="brand-primary-gradient bg-clip-text pb-4 pt-6 font-tuner text-4xl text-transparent">
      {title}
    </h1>
  </div>
);
