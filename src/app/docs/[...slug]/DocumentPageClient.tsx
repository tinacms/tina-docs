"use client";

import { useTina } from "tinacms/dist/react";
import { useScreenResizer } from "@/components/hooks/ScreenResizer";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import { DocsMDXComponentRenderer } from "@/components/tinaMarkdown/DocsMDXComponentRenderer";
import { formatDate } from "@/utils/docs/getFormattedDate";
import DocsPagination from "@/components/ui/Pagination";
import MainDocsBodyHeader from "@/components/docs/MainDocsBodyHeader";
import { useTocListener } from "@/utils/docs/tocListener";
import ToC from "@/components/docs/PageToc";
import { LeftHandSideParentContainer } from "@/components/docs/LeftHandSideParent";
import TocOverflowButton from "@/components/docs/ToCOverflow";

export default function DocumentPageClient({ props }) {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  });

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
    : isScreenSmallerThan1200 || documentationData?.tocIsHidden
      ? "grid-cols-[1.25fr_3fr]"
      : "grid-cols-[1.25fr_3fr_0.75fr]";

  return (
    <div className="relative my-6 flex items-start justify-center lg:my-16">
      {/* eslint-disable-next-line tailwindcss/no-arbitrary-value */}
      <div className={`grid w-full max-w-[2000px] px-3 lg:px-16 ${gridClass}`}>
        {/* LEFT COLUMN */}
        <div
          // eslint-disable-next-line tailwindcss/no-arbitrary-value
          className={`sticky top-32 block h-[calc(100vh)] ${
            isScreenSmallerThan840 ? "hidden" : "block"
          }`}
        >
          <LeftHandSideParentContainer
            tableOfContents={navigationDocsData?.data}
          />
        </div>
        {/* MIDDLE COLUMN */}
        <div className={"mx-8 max-w-full overflow-hidden break-words px-2 "}>
          <MainDocsBodyHeader
            DocumentTitle={documentationData?.title}
            screenResizing={isScreenSmallerThan840}
            NavigationDocsItems={navigationDocsData?.data}
          />
          {isScreenSmallerThan1200 && !documentationData?.tocIsHidden && (
            <TocOverflowButton tocData={pageTableOfContents} />
          )}
          <div
            ref={contentRef}
            className="mt-6 max-w-full space-y-3 pb-6 leading-7 text-slate-800"
          >
            {" "}
            <TinaMarkdown
              content={documentationData?.body}
              components={DocsMDXComponentRenderer}
            />
          </div>
          {formattedDate && (
            <span className="text-md text-slate-500">
              {" "}
              Last Edited: {formattedDate}
            </span>
          )}
          <DocsPagination prevPage={previousPage} nextPage={nextPage} />
        </div>
        {/* RIGHT COLUMN */}
        {documentationData?.tocIsHidden ? null : (
          <div
            // eslint-disable-next-line tailwindcss/no-arbitrary-value
            className={`sticky top-32 block h-[calc(100vh)] ${
              isScreenSmallerThan1200 ? "hidden" : "block"
            }`}
          >
            <ToC tocItems={pageTableOfContents} activeids={activeIds} />
          </div>
        )}
      </div>
    </div>
  );
}
