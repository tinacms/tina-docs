"use client";

import { Breadcrumbs } from "./Breadcrumbs";
import DirectoryOverflowButton from "./DirectoryOverflow";

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
  screenResizing
}) => {
  return (
    <div>
      
      {screenResizing && (
        <DocsMobileHeader data={NavigationDocsItems}></DocsMobileHeader>
      )}

      <Breadcrumbs navItems={NavigationDocsItems} />
      <div
        className="pt-4 font-tuner text-4xl bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent"
      >
        {DocumentTitle}
      </div>
    </div>
  );
};

export default MainDocsBodyHeader;
