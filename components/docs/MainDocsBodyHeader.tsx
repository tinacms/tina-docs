"use client";

import { Breadcrumbs } from "./Breadcrumbs";
import DirectoryOverflowButton from "./DirectoryOverflow";

const DocsMobileHeader = ({ data, header }) => {
  return (
    <div className="relative">
      {header}
      <DirectoryOverflowButton tocData={data.data} />
    </div>
  );
};

const MainDocsBodyHeader = ({
  DocumentTitle,
  NavigationDocsItems,
  header,
}) => {
  return (
    <div>
      <div className="block md:hidden">
        <DocsMobileHeader
          data={NavigationDocsItems}
          header={header}
        ></DocsMobileHeader>
      </div>

      <Breadcrumbs navItems={NavigationDocsItems} />
      <div className="pt-4 font-tuner text-4xl bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
        {DocumentTitle}
      </div>
    </div>
  );
};

export default MainDocsBodyHeader;
