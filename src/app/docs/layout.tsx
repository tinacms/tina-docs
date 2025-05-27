import { Breadcrumbs } from "@/src/components/docs/breadcrumbs";
import TinaLamaIcon from "@/src/components/icons/tina-icon.svg";
import { MobileNavigationWrapper } from "@/src/components/navigation/navigation-dropdown";
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

  const tabs = navigationDocsData.data.map((tab) => ({
    label: tab.title,
    content: tab,
  }));

  return (
    <div className="relative flex flex-col w-full pb-2">
      <Tabs.Root defaultValue={tabs[0].label} className="flex flex-col w-full">
        <TopNav tabs={tabs} navigationDocsData={navigationDocsData?.data} />
        <div className="w-full flex flex-col md:flex-row gap-4 p-4 max-w-[2560px] mx-auto">
          <Sidebar tabs={tabs} />
          <main className="flex-1">
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

const TopNav = ({
  tabs,
  navigationDocsData,
}: {
  tabs: { label: string; content: any }[];
  navigationDocsData: any;
}) => {
  return (
    <div className="mb-2 md:mb-4 w-full px-8 py-1 dark:bg-glass-gradient-end dark:border-b dark:border-neutral-border-subtle/60 shadow-md">
      <div className="max-w-[2560px] mx-auto flex items-center justify-between md:justify-start md:py-0 py-2">
        <Link href="/" className="text-xl">
          <TinaLamaIcon className="h-14 w-auto fill-orange-600 mx-5" />
        </Link>
        <Tabs.List className="lg:flex hidden">
          {tabs.map((tab) => (
            <Tabs.Trigger
              key={tab.label}
              value={tab.label}
              className=" px-1 text-lg relative text-brand-secondary-contrast mx-4 focus:text-brand-secondary-hover cursor-pointer font-semibold data-[state=active]:text-brand-secondary-text after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-0.25 after:bg-brand-secondary-text after:transition-all after:duration-300 after:ease-out data-[state=active]:after:w-full after:w-0"
            >
              {tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        <div className="w-full hidden md:flex justify-end mr-6">
          <LightDarkSwitch />
        </div>
        <Search />
        <MobileNavigationWrapper tocData={navigationDocsData} />
      </div>
    </div>
  );
};

const Sidebar = ({ tabs }: { tabs: { label: string; content: any }[] }) => {
  return (
    <>
      {tabs.map((tab) => (
        <Tabs.Content key={tab.label} value={tab.label}>
          <aside className="sticky top-4 hidden md:block mr-4 h-[calc(100vh-2rem)] xl:w-84 justify-self-center w-72 ml-8">
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
      <Breadcrumbs navItems={navigationDocsData} />
      <div data-pagefind-body id="doc-content">
        {children}
      </div>
    </>
  );
};
