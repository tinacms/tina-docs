import { Breadcrumbs } from "@/src/components/docs/Breadcrumbs";
import DirectoryOverflowButton from "@/src/components/docs/DirectoryOverflow";
import { LeftHandSideBarContainer } from "@/src/components/docs/LeftHandSideParent";
import { getDocsNav } from "@/utils/docs/getDocumentNavigation";
import type React from "react";

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch navigation data that will be shared across all docs pages
  const NavigationDocsData = await getDocsNav();
  const headerComponent = (
    <div className="pl-6">
      <h1
        className={
          "bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 bg-clip-text pb-4 pt-6 font-tuner text-4xl text-transparent"
        }
      >
        TinaDocs
      </h1>
    </div>
  );

  return (
    <div className="relative my-6 flex items-start justify-center lg:mb-16 xl:mt-16">
      <div
        className={
          "grid w-full max-w-[2000px] grid-cols-1 px-3 md:grid-cols-[1.25fr_3fr] md:px-8 xl:grid-cols-[1.25fr_3fr_0.75fr] xl:px-16"
        }
      >
        {/* LEFT SIDEBAR COLUMN */}
        <div className={"sticky top-32 hidden h-[calc(100vh)] md:block"}>
          <LeftHandSideBarContainer
            tableOfContents={NavigationDocsData.data}
            header={headerComponent}
          />
        </div>
        {/* CONTENT COLUMN */}
        <div className="col-span-2 mx-8 px-2 md:col-span-1 xl:col-span-2">
          <div className="block md:hidden">
            <div className="relative">
              <DirectoryOverflowButton tocData={NavigationDocsData.data} />
            </div>
          </div>

          <Breadcrumbs navItems={NavigationDocsData.data} />
          {children}
        </div>
      </div>
    </div>
  );
}
