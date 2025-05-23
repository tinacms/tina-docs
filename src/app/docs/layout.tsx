import { CopyPageDropdown } from "@/src/components/copy-page-dropdown";
import { Breadcrumbs } from "@/src/components/docs/breadcrumbs";
import { NavigationDropdown } from "@/src/components/navigation/navigation-dropdown";
import { TabbedNavigation } from "@/src/components/navigation/tabbed-navigation";
import { TinaIcon } from "@/src/components/icons";
import { getDocsNavigation } from "@/utils/docs";
import type React from "react";
import Link from "next/link";
import * as Tabs from "@radix-ui/react-tabs";
export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch navigation data that will be shared across all docs pages
  const navigationDocsData = await getDocsNavigation();

  // Define your tabs here
  const tabs = [
    {
      id: "docs",
      label: "Docs",
      content: navigationDocsData.data,
    },
    {
      id: "learn",
      label: "Learn",
      content: navigationDocsData.data, // Replace with actual learn navigation data
    },
    {
      id: "api",
      label: "API",
      content: navigationDocsData.data, // Replace with actual API navigation data
    },
    {
      id: "logs",
      label: "Logs",
      content: navigationDocsData.data, // Replace with actual logs navigation data
    },
  ];

  return (
    <div className="relative flex flex-col w-full max-w-[2000px]">
      {/* Top Navbar */}
      <nav className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-[2000px] mx-auto px-4 py-3">
          <div className="flex items-center justify-start">
            <div className="flex items-center font-semibold">
              <Link
                href="/"
                className="text-xl font-bold text-gray-800 dark:text-white"
              >
                <TinaIcon className="h-10 w-auto fill-orange-500" />
              </Link>
              <Tabs.Root
                className="flex flex-col w-full"
                defaultValue={tabs[0]?.id}
              >
                <Tabs.List
                  className="flex border-b border-gray-200 dark:border-gray-700"
                  aria-label="Navigation sections"
                >
                  {tabs.map((tab) => (
                    <Tabs.Trigger
                      key={tab.id}
                      value={tab.id}
                      className="relative px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200
              data-[state=active]:text-brand-primary
              after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-brand-primary after:scale-x-0 after:transition-transform after:duration-200
              data-[state=active]:after:scale-x-100"
                    >
                      {tab.label}
                    </Tabs.Trigger>
                  ))}
                </Tabs.List>
                {tabs.map((tab) => (
                  <Tabs.Content
                    key={tab.id}
                    value={tab.id}
                    className="flex-1 data-[state=inactive]:hidden data-[state=active]:animate-fadeIn"
                  ></Tabs.Content>
                ))}
              </Tabs.Root>
            </div>
          </div>
        </div>
      </nav>

      <div className="w-full grid grid-cols-1 md:grid-cols-[35%_65%] lg:grid-cols-[25%_75%] gap-4 p-4">
        {/* DESKTOP NAVIGATION SIDEBAR */}
        <aside className="sticky top-4 hidden md:block mr-4 h-[calc(100vh-2rem)]">
          <TabbedNavigation tabs={tabs} defaultTab="docs" />
        </aside>
        {/* CONTENT COLUMN */}
        <main className="">
          {/* MOBILE NAVIGATION DROPDOWN */}
          <div className="block md:hidden">
            <div className="relative">
              <NavigationDropdown tocData={navigationDocsData.data} />
            </div>
          </div>

          <Breadcrumbs navItems={navigationDocsData.data} />
          <div data-pagefind-body id="doc-content">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
