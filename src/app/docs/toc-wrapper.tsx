"use client";

import { Breadcrumbs } from "@/components/docs/Breadcrumbs";
import DirectoryOverflowButton from "@/components/docs/DirectoryOverflow";
import { LeftHandSideParentContainer } from "@/components/docs/LeftHandSideParent";
import React from "react";

type DocsLayoutClientProps = {
  NavigationDocsData: any;
} & React.PropsWithChildren;

export default function DocsLayoutClient({
  NavigationDocsData,
  children,
}: DocsLayoutClientProps) {
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
        // eslint-disable-next-line tailwindcss/no-arbitrary-value
        className={
          "grid w-full max-w-[2000px] grid-cols-1 px-3 md:grid-cols-[1.25fr_3fr] md:px-8 xl:grid-cols-[1.25fr_3fr_0.75fr] xl:px-16"
        }
      >
        {/* LEFT COLUMN */}
        {/* eslint-disable-next-line tailwindcss/no-arbitrary-value */}
        <div className={"sticky top-32 hidden h-[calc(100vh)] md:block"}>
          <LeftHandSideParentContainer
            tableOfContents={NavigationDocsData.data}
            header={headerComponent}
          />
        </div>
        {/* MIDDLE COLUMN */}
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
