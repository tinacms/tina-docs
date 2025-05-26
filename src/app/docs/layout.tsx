import { Breadcrumbs } from "@/src/components/docs/breadcrumbs";
import TinaLamaIcon from "@/src/components/icons/tina-icon.svg";
import { NavigationDropdown } from "@/src/components/navigation/navigation-dropdown";
import { NavigationSideBar } from "@/src/components/navigation/navigation-sidebar";
import { Search } from "@/src/components/search-docs/search";
import LightDarkSwitch from "@/src/components/ui/light-dark-switch";
import { getDocsNavigation } from "@/utils/docs";
import * as Tabs from "@radix-ui/react-tabs";
import Link from "next/link";
import type React from "react";

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch navigation data that will be shared across all docs pages
  const navigationDocsData = await getDocsNavigation();

  // TODO: Make this editable through TinaCMS
  const tabs = [
    {
      label: "Docs",
      content: navigationDocsData.data,
    },
    {
      label: "Learn",
      content: null, // TODO: Replace with actual learn navigation data
    },
    {
      label: "API",
      content: null, // TODO: Replace with actual API navigation data
    },
    {
      label: "Logs",
      content: null, // TODO: Replace with actual logs navigation data
    },
  ];

  return (
    <div className="relative flex flex-col w-full pb-2">
      <Tabs.Root defaultValue={tabs[0].label} className="flex flex-col w-full">
        <TopNav tabs={tabs} />
        <div className="w-full grid grid-cols-1 md:grid-cols-[35%_65%] lg:grid-cols-[25%_75%] gap-4 p-4">
          <Sidebar tabs={tabs} />
          <main>
            <Body
              navigationDocsData={navigationDocsData?.data}
              children={children}
            />
          </main>
        </div>
      </Tabs.Root>
    </div>
  );
}

const TopNav = ({ tabs }: { tabs: { label: string; content: any }[] }) => {
  return (
    <div className="flex items-center justify-start font-semibold w-full border-b border-neutral-border py-3 shadow">
      <Link href="/" className="text-xl">
        <TinaLamaIcon className="h-10 w-auto fill-orange-600 mx-5" />
      </Link>
      <Tabs.List className="flex">
        {tabs.map((tab) => (
          <Tabs.Trigger
            key={tab.label}
            value={tab.label}
            className="text-lg relative text-neutral-text mx-4 focus:text-brand-secondary-hover cursor-pointer font-bold  data-[state=active]:text-blue-600 "
          >
            {tab.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      <div className="w-full hidden md:flex justify-end mr-2">
        <LightDarkSwitch />
      </div>
      <Search className="hidden md:block" />
    </div>
  );
};

const Sidebar = ({ tabs }: { tabs: { label: string; content: any }[] }) => {
  return (
    <>
      {tabs.map((tab) => (
        <Tabs.Content key={tab.label} value={tab.label}>
          <aside className="sticky top-4 hidden md:block mr-4 h-[calc(100vh-2rem)]">
            <NavigationSideBar
              title={tab?.label}
              tableOfContents={tab?.content}
            />
          </aside>
        </Tabs.Content>
      ))}
    </>
  );
};

const Body = ({
  children,
  navigationDocsData,
}: {
  children: React.ReactNode;
  navigationDocsData: any;
}) => {
  return (
    <>
      {/* MOBILE NAVIGATION DROPDOWN */}
      <div className="block md:hidden">
        <div className="relative">
          <NavigationDropdown tocData={navigationDocsData} />
        </div>
      </div>

      <Breadcrumbs navItems={navigationDocsData} />
      <div data-pagefind-body id="doc-content">
        {children}
      </div>
    </>
  );
};
