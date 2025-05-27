"use client";

import { DocsNavigationItems } from "./navigation-items";

export const NavigationSideBar = ({
  title,
  tableOfContents,
}: {
  title: string;
  tableOfContents: any;
}) => {
  return (
    <div className="w-full h-full rounded-2xl brand-glass-gradient shadow-xl">
      <div className="overflow-y-auto overflow-x-hidden pl-4 2xl:max-h-[75vh] 2xl:pl-0">
        {tableOfContents && (
          <DocsNavigationItems navItems={tableOfContents.items} />
        )}
      </div>
    </div>
  );
};

const Title = ({ title }: { title: string }) => (
  <h1 className="ml-2 brand-primary-gradient bg-clip-text pb-4 pt-6 font-tuner text-4xl text-transparent">
    {title}
  </h1>
);
