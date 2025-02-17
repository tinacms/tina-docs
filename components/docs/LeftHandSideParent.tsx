'use client';

import { DocsNavigationList } from './DocsNavigationList';

export const LeftHandSideParentContainer = ({ tableOfContents }: { tableOfContents: any }) => {
  return (
    <div className="rounded-2xl shadow-xl w-full bg-white/50 h-5/6">
        <h1
          className={`text-4xl pb-4 font-tuner pl-6 pt-6 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent`}
        >
          TinaDocs
        </h1>
      <div className="overflow-y-scroll overflow-x-hidden h-[76%] 2xl:max-h-[75vh] pl-4 2xl:pl-0">
        <DocsNavigationList navItems={tableOfContents} />
      </div>
    </div>
  );
};
