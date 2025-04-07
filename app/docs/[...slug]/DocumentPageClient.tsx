"use client";

import { useTina } from "tinacms/dist/react";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import { DocsMDXComponentRenderer } from "../../../components/tinaMarkdown/DocsMDXComponentRenderer";
import { formatDate } from "../../../utils/generic/getFormattedDate";
import DocsPagination from "../../../components/ui/Pagination";
import MainDocsBodyHeader from "../../../components/docs/MainDocsBodyHeader";
import { useTocListener } from "../../../utils/navigation/tocListener";
import ToC from "../../../components/docs/PageToc";
import TocOverflowButton from "../../../components/docs/ToCOverflow";

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

  return (
      <div className={`grid grid-cols-1 md:grid-cols-[3fr_0.5fr] xl:grid-cols-[3fr_0.25fr]`}>
        {/* MIDDLE COLUMN */}
        <div className={`mx-8 max-w-full overflow-hidden break-words px-2 ${
          !documentationData?.tocIsHidden ? 'xl:col-span-1' : ''
        }`}>
          <MainDocsBodyHeader
            DocumentTitle={documentationData?.title}
            NavigationDocsItems={navigationDocsData?.data}
            header={"Tina Docs"}
          />
          <div className="block xl:hidden"> 
            <TocOverflowButton tocData={pageTableOfContents} />
          </div>
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
            className={`sticky top-32 h-[calc(100vh)] hidden xl:block`}
          >
            <ToC tocItems={pageTableOfContents} activeIds={activeIds} />
          </div>
        )}
      </div>
  );
}
