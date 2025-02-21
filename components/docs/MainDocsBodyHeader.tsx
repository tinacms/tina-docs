'use client';

import { Breadcrumbs } from './Breadcrumbs';
// import DocsMobileHeader from './docsMobileHeader';

const MainDocsBodyHeader = ({ DocumentTitle, NavigationDocsItems, }) => {
  return (
    <div>
      {/* TOOD: Add DocsMobileHeader back */}
      {/* {screenResizing && (
        <DocsMobileHeader data={NavigationDocsItems}></DocsMobileHeader>
      )} */}

      <Breadcrumbs navItems={NavigationDocsItems} />
      <div className="pt-4 font-tuner text-4xl bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
        {DocumentTitle}
      </div>
    </div>
  );
};

export default MainDocsBodyHeader;
