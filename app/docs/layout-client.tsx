'use client';

import { DocsNavigationProvider } from '../../components/docs/DocsNavigationContext';
import { LeftHandSideParentContainer } from '../../components/docs/LeftHandSideParent';
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useVersion } from '../../components/docs/VersionContext';
import { FaChevronRight } from "react-icons/fa";
import { useRouter } from 'next/navigation';


type NavigationDataContextType = {
  NavigationDocsData: any;
};

function VersionSelectHeader(props) {
    const { versions, title, currentVersion } = props;
    const { setCurrentVersion } = useVersion();
  
    //-1 for latest, otherwise the index of the version
    const [versionSelected, setVersionSelected] = useState(versions.indexOf(currentVersion) ?? -1);
    const [isOverflowOpen, setIsOverflowOpen] = useState(false);
  
    useEffect(() => {
      setVersionSelected(versions.indexOf(currentVersion) ?? -1);
    }, [currentVersion, versions]);

    const router = useRouter();
  
    const handleVersionClick = (version) => {
      setVersionSelected(version);
      setIsOverflowOpen(false);
  
      if (version === -1) {
        setCurrentVersion('Latest');
        router.push("/docs");
      } else {
        setCurrentVersion(versions[version]);
        router.push(`/docs/_versions/${versions[version]}/index`);
      }
    };
  
    return (
      <div className="pl-6">
        <h1
          className={`text-4xl pb-4 font-tuner pt-6 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent`}
        >
          {title}
        </h1>
        <div className="relative max-w-30">
          <div
            className="bg-white cursor-pointer px-4 py-1 rounded-lg shadow-md flex justify-center text-center items-center text-stone-600"
            onClick={() => setIsOverflowOpen(!isOverflowOpen)}
          >
            <div>{versions[versionSelected] ?? "Latest"}</div>
            <div>
              <FaChevronRight
                className={`ml-2 transform transition-transform duration-300 ${
                  isOverflowOpen ? "rotate-90" : ""
                }`}
              />
            </div>
          </div>
          {isOverflowOpen && (
            <div className="absolute bg-white shadow-lg mt-2 rounded-lg w-full z-10 animate-fade-down animate-duration-300">
              <div
                  className={`px-4 py-2 hover:bg-stone-100 cursor-pointer ${
                    currentVersion === 'Latest' ? "font-bold text-orange-500" : "text-stone-600"
                  }`}
                  onClick={() => handleVersionClick(-1)}
                >
                  Latest
                </div>
              {versions.map((version, index) => (
                <div
                  key={index}
                  className={`px-4 py-2 hover:bg-stone-100 cursor-pointer  ${
                    version === currentVersion ? "font-bold text-orange-500" : "text-stone-600"
                  }`}
                  onClick={() => handleVersionClick(index)}
                >
                  {version}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

const NavigationDataContext = createContext<NavigationDataContextType>({
  NavigationDocsData: {},
});

// Export a hook to access navigation data
export const useNavigationData = () => useContext(NavigationDataContext);

export default function DocsLayoutClient({
  children,
  NavigationDocsData,
  header,
  versions
}: {
  children: React.ReactNode;
  NavigationDocsData: any;
  header: string;
  versions: any;
}) {
  const { currentVersion, setCurrentVersion } = useVersion();

  const getTocData = useCallback((version) => {
    if (version === 'Latest' || !version) {
      return NavigationDocsData.filter((item) => !item.node._sys.breadcrumbs.some((breadcrumb) => breadcrumb === "_versions"))[0]?.node?.supermenuGroup;
    }
    return NavigationDocsData.filter((item) => item.node._sys.breadcrumbs.some((breadcrumb) => breadcrumb === version))[0]?.node?.supermenuGroup;
  }, [NavigationDocsData]);

  const [tocData, setTocData] = useState(null);

  useEffect(() => {
    // Update currentVersion based on URL
    const path = window.location.pathname;
    if (path.includes('/_versions/')) {
      const versionFromPath = path.split('/_versions/')[1].split('/')[0];
      setCurrentVersion(versionFromPath);
    } else {
      setCurrentVersion('Latest');
    }
  }, [setCurrentVersion]);

  useEffect(() => {
    setTocData(getTocData(currentVersion));
  }, [currentVersion, getTocData]);


  const headerComponent = <VersionSelectHeader versions={versions} title={header} currentVersion={currentVersion} />;

  return (
    //@ts-ignore
    <DocsNavigationProvider>
      <NavigationDataContext.Provider value={{ NavigationDocsData }}>
        <div className="relative my-6 lg:mb-16 xl:mt-16 flex justify-center items-start">
          <div
            className={`xl:px-16 md:px-8 px-3 w-full max-w-[2000px] grid grid-cols-1 md:grid-cols-[1.25fr_3fr] xl:grid-cols-[1.25fr_3fr_0.75fr]`}
          >

            {/* LEFT COLUMN */}
            <div className={`sticky top-32 h-[calc(100vh)] hidden md:block`}>
              <LeftHandSideParentContainer
                tableOfContents={tocData}
                header={headerComponent}
              />
            </div>
            {/* MIDDLE COLUMN */}
            <div className="col-span-2 md:col-span-1 xl:col-span-2">
              {children}
            </div>
          </div>
        </div>
      </NavigationDataContext.Provider>
    </DocsNavigationProvider>
  );
}
