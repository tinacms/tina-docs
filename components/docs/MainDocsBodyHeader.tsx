"use client";

import { Breadcrumbs } from "./Breadcrumbs";
import DirectoryOverflowButton from "./DirectoryOverflow";
// import DocsMobileHeader from './docsMobileHeader';

const DocsMobileHeader = (data) => {
  
  return (
    <div className="relative">
      <DirectoryOverflowButton tocData={data.data} />
    </div>
  );
};

const MainDocsBodyHeader = ({
  DocumentTitle,
  NavigationDocsItems,
  globalSiteConfigColors,
  screenResizing
}) => {
  return (
    <div>
      {/* TOOD: Add DocsMobileHeader back */}
      {screenResizing && (
        <DocsMobileHeader data={NavigationDocsItems}></DocsMobileHeader>
      )}

      <Breadcrumbs navItems={NavigationDocsItems} />
      <div
        className="pt-4 font-tuner text-4xl"
        style={{
          backgroundImage: `linear-gradient(to bottom right, ${globalSiteConfigColors?.primaryStart}, ${globalSiteConfigColors?.primaryVia}, ${globalSiteConfigColors?.primaryEnd})`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        {DocumentTitle}
      </div>
    </div>
  );
};

export default MainDocsBodyHeader;
