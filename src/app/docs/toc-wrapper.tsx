"use client";

import { Breadcrumbs } from "@/components/docs/Breadcrumbs";
import DirectoryOverflowButton from "@/components/docs/DirectoryOverflow";
import { useVersion } from "@/components/docs/VersionContext";
import VersionSelector from "@/components/docs/VersionSelector";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { LeftHandSideParentContainer } from "../../components/docs/LeftHandSideParent";

type NavigationDataContextType = {
  NavigationDocsData: any;
  versionsData: any;
};

const NavigationDataContext = createContext<NavigationDataContextType>({
  NavigationDocsData: {},
});

// Export a hook to access navigation data
export const useNavigationData = () => useContext(NavigationDataContext);

export default function DocsLayoutClient({
  children,
  NavigationDocsData,
  versionsData,
}: {
  children: React.ReactNode;
  NavigationDocsData: any;
  versionsData: any;
}) {
  const { currentVersion, setCurrentVersion } = useVersion();

  const getTocData = useCallback(
    (version) => {
      if (version === "Latest" || !version) {
        return NavigationDocsData.filter(
          (item) =>
            !item.node._sys.breadcrumbs.some(
              (breadcrumb) => breadcrumb === "_versions",
            ),
        )[0]?.node?.supermenuGroup;
      }
      return NavigationDocsData.filter((item) =>
        item.node._sys.breadcrumbs.some((breadcrumb) => breadcrumb === version),
      )[0]?.node?.supermenuGroup;
    },
    [NavigationDocsData],
  );

  const [tocData, setTocData] = useState(null);

  useEffect(() => {
    // Update currentVersion based on URL
    const path = window.location.pathname;
    if (path.includes("/_versions/")) {
      const versionFromPath = path.split("/_versions/")[1].split("/")[0];
      setCurrentVersion(versionFromPath);
    } else {
      setCurrentVersion("Latest");
    }
  }, [setCurrentVersion]);

  useEffect(() => {
    setTocData(getTocData(currentVersion));
  }, [currentVersion, getTocData]);

  const headerComponent = (
    <div className="pl-6">
      <h1
        className={
          "bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 bg-clip-text pb-4 pt-6 font-tuner text-4xl text-transparent"
        }
      >
        TinaDocs
      </h1>
      <VersionSelector versions={versionsData} />
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
            tableOfContents={tocData}
            header={headerComponent}
          />
        </div>
        {/* MIDDLE COLUMN */}
        <div className="col-span-2 mx-8 px-2 md:col-span-1 xl:col-span-2">
          <div className="block md:hidden">
            <div className="relative">
              <DirectoryOverflowButton tocData={tocData} />
            </div>
          </div>

          <Breadcrumbs navItems={tocData} />
          {children}
        </div>
      </div>
    </div>
  );
}
