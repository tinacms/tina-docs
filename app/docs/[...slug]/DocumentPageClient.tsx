"use client";

import { useTina } from "tinacms/dist/react";
import { useScreenResizer } from "../../../components/hooks/ScreenResizer";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import { DocsMDXComponentRenderer } from "../../../components/tinaMarkdown/DocsMDXComponentRenderer";
import { formatDate } from "../../../utils/docs/getFormattedDate";
import DocsPagination from "../../../components/ui/Pagination";
import MainDocsBodyHeader from "../../../components/docs/MainDocsBodyHeader";
import { useTocListener } from "../../../utils/docs/tocListener";
import ToC from "../../../components/docs/PageToc";
import { LeftHandSideParentContainer } from "../../../components/docs/LeftHandSideParent";
import TocOverflowButton from "../../../components/docs/ToCOverflow";

export default function DocumentPageClient({ props }) {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  });
  const { globalSiteConfig } = props;

  console.log("globalSiteConfig", globalSiteConfig);

  const documentationData = data.docs;
  const { pageTableOfContents, navigationDocsData } = props;

  const formattedDate = formatDate(documentationData?.last_edited);
  const previousPage = {
    slug: documentationData?.previous?.id.slice(7, -4),
    title: documentationData?.previous?.title,
  };

  const nextPage = {
    slug: documentationData?.next?.id.slice(7, -4),
    title: documentationData?.next?.title,
  };

  const { activeIds, contentRef } = useTocListener(documentationData);

  const isScreenSmallerThan1200 = useScreenResizer().isScreenSmallerThan1200;
  const isScreenSmallerThan840 = useScreenResizer().isScreenSmallerThan840;
  const gridClass = isScreenSmallerThan840
    ? "grid-cols-1"
    : isScreenSmallerThan1200
    ? "grid-cols-[1.25fr_3fr]"
    : "grid-cols-[1fr_3fr_0.75fr]"; 

  return (
    <div className="relative my-6 lg:my-16 flex justify-center items-start">
      <div className={`lg:px-16 px-3 w-full max-w-[2000px] grid ${gridClass}`}>
        {/* LEFT COLUMN */}
        <div
          className={`block sticky top-32 h-[calc(100vh)] ${
            isScreenSmallerThan840 ? "hidden" : "block"
          }`}
        >
          <LeftHandSideParentContainer
            tableOfContents={navigationDocsData?.data}
            globalSiteConfigTitle={globalSiteConfig?.documentationSiteTitle}
            globalSiteConfigColors={globalSiteConfig?.siteColors}
            leftSidebarColors={globalSiteConfig?.siteColors.leftHandSideNavigation}
          />
        </div>
        {/* MIDDLE COLUMN */}
        <div className={`mx-8 max-w-full overflow-hidden break-words px-2 `}>
          <MainDocsBodyHeader
            DocumentTitle={documentationData?.title}
            screenResizing={isScreenSmallerThan840}
            NavigationDocsItems={navigationDocsData?.data}
            globalSiteConfigColors={globalSiteConfig?.siteColors}
          />
          {isScreenSmallerThan1200 && !documentationData?.tocIsHidden && (
            <TocOverflowButton tocData={pageTableOfContents} />
          )}
          <div ref={contentRef}>
            <TinaMarkdown
              content={documentationData?.body}
              components={DocsMDXComponentRenderer}
            />
          </div>
          {formattedDate && (
            <span className="text-slate-500 text-md">
              {" "}
              Last Edited: {formattedDate}
            </span>
          )}
          <DocsPagination prevPage={previousPage} nextPage={nextPage} />
        </div>
        {/* RIGHT COLUMN */}
        {documentationData?.tocIsHidden ? null : (
          <div
            className={`block sticky top-32 h-[calc(100vh)] ${
              isScreenSmallerThan1200 ? "hidden" : "block"
            }`}
          >
            <ToC
              tocItems={pageTableOfContents}
              activeIds={activeIds}
              globalSiteConfigColors={globalSiteConfig?.siteColors}
            />
          </div>
        )}
      </div>
    </div>
  );
}
