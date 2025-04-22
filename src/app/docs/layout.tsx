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
    <div className="relative my-6 flex items-start justify-center lg:mb-16 xl:mt-16">
      <div className="grid w-full max-w-[2000px] grid-cols-1 px-3 md:grid-cols-[1.25fr_3fr] md:px-8 xl:grid-cols-[1.25fr_3fr_0.75fr] xl:px-16">
        {/* DESKTOP NAVIGATION SIDEBAR */}
        <aside className={"sticky top-32 hidden md:block h-[calc(100vh-8rem)]"}>
          <NavigationSideBar tableOfContents={navigationDocsData.data} />
        </aside>
        {/* CONTENT COLUMN */}
        <main className="col-span-2 mx-8 px-2 md:col-span-1 xl:col-span-2 xl:top-12 relative sm:top-22">
          {/* MOBILE NAVIGATION DROPDOWN */}
          <div className="block md:hidden">
            <div className="relative">
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
