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

  return (
    <div className="relative flex flex-col w-full">
      {/* Top Navbar */}

      <nav className="w-full">
        <div className="py-2">
          <div>
            <Tabs.Root defaultValue="1" className="flex flex-col w-full">
              <div className="flex items-center justify-start font-semibold w-full border-b border-neutral-border py-3">
                <Link
                  href="/"
                  className="text-xl font-bold text-gray-800 dark:text-white"
                >
                  <TinaIcon className="h-10 w-auto fill-orange-500 mr-4 ml-2" />
                </Link>
                <Tabs.List className="flex">
                  {tabs.map((tab) => (
                    <Tabs.Trigger
                      key={tab.id}
                      value={tab.id}
                      className="relative text-brand-secondary-dark-dark mx-4 focus:text-brand-secondary-hover cursor-pointer"
                    >
                      {tab.label}
                    </Tabs.Trigger>
                  ))}
                </Tabs.List>
              </div>

              <div className="w-full grid grid-cols-1 md:grid-cols-[35%_65%] lg:grid-cols-[25%_75%] gap-4 p-4">
                {tabs.map((tab) => (
                  <Tabs.Content key={tab.id} value={tab.id}>
                    {tab.content2}
                    <aside className="sticky top-4 hidden md:block mr-4 h-[calc(100vh-2rem)]">
                      <NavigationSideBar
                        tableOfContents={navigationDocsData.data}
                      />
                    </aside>
                  </Tabs.Content>
                ))}
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
            </Tabs.Root>
          </div>
        </div>
      </nav>
    </div>
  );
}
