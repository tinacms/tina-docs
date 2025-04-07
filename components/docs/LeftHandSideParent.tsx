'use client';

import { DocsNavigationList } from './DocsNavigationList';



export const LeftHandSideParentContainer = ({ tableOfContents, header }: { tableOfContents: any, header: any }) => {

  return (
    <div className="rounded-2xl shadow-xl w-full bg-white/50 h-5/6">
      {header}
      <div className="overflow-y-scroll overflow-x-hidden h-[76%] 2xl:max-h-[75vh] pl-4 2xl:pl-0">
        <DocsNavigationList navItems={tableOfContents} />
      </div>
    </div>
  );
};
