"use client";

import ToC from "@/components/docs/PageToc";
import TocOverflowButton from "@/components/docs/ToCOverflow";
import { DocsMDXComponentRenderer } from "@/components/tinaMarkdown/DocsMDXComponentRenderer";
import DocsPagination from "@/components/ui/Pagination";
import { formatDate } from "@/utils/docs/getFormattedDate";
import { useTocListener } from "@/utils/docs/tocListener";
import { useTina } from "tinacms/dist/react";
import { TinaMarkdown } from "tinacms/dist/rich-text";

export default function DocumentPageClient({ props }) {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  });

  const documentationData = data.docs;
  const { pageTableOfContents } = props;

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
    <div
      className={`grid grid-cols-1 md:grid-cols-[3fr_0.5fr] xl:grid-cols-[3fr_0.25fr]`}
    >
      {/* MIDDLE COLUMN */}
      <div
        className={`max-w-full overflow-hidden break-words ${
          !documentationData?.tocIsHidden ? "xl:col-span-1" : ""
        }`}
      >
        <div>
          <div className="pt-4 font-tuner text-4xl bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
            {documentationData?.title}
          </div>
        </div>
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
        <div className={`sticky top-32 h-[calc(100vh)] hidden xl:block mx-8`}>
          <ToC tocItems={pageTableOfContents} activeids={activeIds} />
        </div>
      )}
    </div>
  );
}
