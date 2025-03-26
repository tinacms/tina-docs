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
      // Cant use from-primaryStart (a tailwind extesion) as gradients dont use th theme.colors values 
        className="pt-4 font-tuner text-4xl bg-gradient-to-br from-[var(--primary-color-start)] via-[var(--primary-color-via)] to-[var(--primary-color-end)] bg-clip-text text-transparent"

      >
        {DocumentTitle}
      </div>
    </div>
  );
};

export default MainDocsBodyHeader;
