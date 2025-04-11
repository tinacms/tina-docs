"use client";

import { Breadcrumbs } from "@/components/docs/Breadcrumbs";
import { LeftHandSideParentContainer } from "../../components/docs/LeftHandSideParent";
import React from "react";
import DirectoryOverflowButton from "@/components/docs/DirectoryOverflow";

export default function DocsLayoutClient({
  children,
  NavigationDocsData,
}: {
  children: React.ReactNode;
  NavigationDocsData: any;
}) {
  const headerComponent = (
    <div className="pl-6">
      <h1
        className={`text-4xl pb-4 font-tuner pt-6 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent`}
      >
        TinaDocs
      </h1>
    </div>
  );

  return (
    <div className="relative my-6 lg:mb-16 xl:mt-16 flex justify-center items-start">
      <div
        className={`xl:px-16 md:px-8 px-3 w-full max-w-[2000px] grid grid-cols-1 md:grid-cols-[1.25fr_3fr] xl:grid-cols-[1.25fr_3fr_0.75fr]`}
      >
        {/* LEFT COLUMN */}
        <div className={`sticky top-32 h-[calc(100vh)] hidden md:block`}>
          <LeftHandSideParentContainer
            tableOfContents={NavigationDocsData.data}
            header={headerComponent}
          />
        </div>
        {/* MIDDLE COLUMN */}
        <div className="col-span-2 md:col-span-1 xl:col-span-2 mx-8 px-2">
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
