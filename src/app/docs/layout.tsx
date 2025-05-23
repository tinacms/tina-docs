import { CopyPageDropdown } from "@/src/components/copy-page-dropdown";
import { Breadcrumbs } from "@/src/components/docs/breadcrumbs";
import { NavigationDropdown } from "@/src/components/navigation/navigation-dropdown";
import { TabbedNavigation } from "@/src/components/navigation/tabbed-navigation";
import { TinaIcon } from "@/src/components/icons";
import { getDocsNavigation } from "@/utils/docs";
import type React from "react";
import Link from "next/link";
import * as Tabs from "@radix-ui/react-tabs";
import { NavigationSideBar } from "@/src/components/navigation/navigation-sidebar";
import { motion, AnimatePresence } from "framer-motion";

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
      content2: "Hello Docs",
    },
    {
      id: "learn",
      label: "Learn",
      content: null, // Replace with actual learn navigation data
      content2: "Hello Learn",
    },
    {
      id: "api",
      label: "API",
      content: null, // Replace with actual API navigation data
      content2: "Hello API",
    },
    {
      id: "logs",
      label: "Logs",
      content: null, // Replace with actual logs navigation data
      content2: "Hello Logs",
    },
  ];

  const activeTab = "1";
  const setActiveTab = (tab: string) => {
    console.log(tab);
  };
  return (
    <div className="relative flex flex-col w-full max-w-[2000px]">
      {/* Top Navbar */}

      <nav className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-[2000px] mx-auto px-4 py-3">
          <div className="flex items-center justify-start font-semibold w-full">
            <Link
              href="/"
              className="text-xl font-bold text-gray-800 dark:text-white"
            >
              <TinaIcon className="h-10 w-auto fill-orange-500" />
            </Link>

            <Tabs.Root defaultValue="1" className="flex flex-col w-full ml-6">
              <Tabs.List className="flex border-b border-gray-200 dark:border-gray-700">
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

              <div className="relative w-full h-[300px] overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg mt-4">
                {tabs.map((tab) => (
                  <Tabs.Content
                    key={tab.id}
                    value={tab.id}
                    className="absolute top-0 left-0 w-full h-full opacity-0 translate-x-10 transition-all duration-500 ease-in-out
                  data-[state=active]:opacity-100 data-[state=active]:translate-x-0"
                  >
                    <div className="w-full h-full p-4 bg-white dark:bg-gray-800 shadow-lg">
                      <div className="text-xl font-bold mb-4">
                        {tab.label} Content
                      </div>
                      <div className="text-gray-600 dark:text-gray-300">
                        {tab.content}
                      </div>
                    </div>
                  </Tabs.Content>
                ))}
              </div>
            </Tabs.Root>
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
