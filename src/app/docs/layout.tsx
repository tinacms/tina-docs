import { Breadcrumbs } from "@/src/components/docs/breadcrumbs";
import { NavigationDropdown } from "@/src/components/navigation/navigation-dropdown";
import { NavigationSideBar } from "@/src/components/navigation/navigation-sidebar";
import { getDocsNav } from "@/utils/docs/getDocumentNavigation";
import type React from "react";

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch navigation data that will be shared across all docs pages
  const navigationDocsData = await getDocsNav();

  return (
    <div className="relative flex items-start justify-center max-w-[2000px] ">
      <div className="w-full grid grid-cols-[25%_75%] gap-4  p-4 ">
        {/* DESKTOP NAVIGATION SIDEBAR */}
        <aside
          className={"sticky top-4 hidden md:block mr-4 h-[calc(100vh-2rem)]"}
        >
          <NavigationSideBar tableOfContents={navigationDocsData.data} />
        </aside>
        {/* CONTENT COLUMN */}
        <main className="">
          {/* MOBILE NAVIGATION DROPDOWN */}
          <div className="block md:hidden ">
            <div className="relative ">
              <NavigationDropdown tocData={navigationDocsData.data} />
            </div>
          </div>

          <Breadcrumbs navItems={navigationDocsData.data} />
          {children}
        </main>
      </div>
    </div>
  );
}
