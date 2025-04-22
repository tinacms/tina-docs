"use client";

import { DocsNavigationItems } from "./NavigationItems";

export const NavigationSideBar = ({
  tableOfContents,
}: {
  tableOfContents: any;
}) => {
  return (
    <div className="h-5/6 w-full rounded-2xl bg-white/50 shadow-xl">
      <Title title={tableOfContents?.title} />
      <div className="h-[76%] overflow-y-auto overflow-x-hidden pl-4 2xl:max-h-[75vh] 2xl:pl-0">
        <DocsNavigationItems navItems={tableOfContents.items} />
      </div>
    </div>
  );
};

const Title = ({ title }: { title: string }) => (
  <div className="pl-6">
    <h1 className="bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 bg-clip-text pb-4 pt-6 font-tuner text-4xl text-transparent">
      {title}
    </h1>
  </div>
);
