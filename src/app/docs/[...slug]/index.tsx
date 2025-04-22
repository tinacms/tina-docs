"use client";

import { TableOfContents } from "@/components/docs/table-of-contents";
import { TableOfContentsDropdown } from "@/components/docs/table-of-contents-dropdown";
import MarkdownComponentMapping from "@/components/tina-markdown/markdown-component-mapping";
import { Pagination } from "@/src/components/ui/zpagination";
import { formatDate } from "@/utils/docs/getFormattedDate";
import { useTocListener } from "@/utils/docs/tocListener";
import { tinaField } from "tinacms/dist/react";
import { TinaMarkdown } from "tinacms/dist/rich-text";

export default function Document({ props, tinaProps }) {
  const { data } = tinaProps;

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
    <div className="grid grid-cols-1 md:grid-cols-[3fr_0.5fr] xl:grid-cols-[3fr_0.25fr]">
      <div
        className={`max-w-full overflow-hidden break-words ${
          !documentationData?.tocIsHidden ? "xl:col-span-1" : ""
        }`}
      >
        <div
          className="tina-gradient pt-4 font-tuner text-4xl"
          data-tina-field={tinaField(documentationData, "title")}
        >
          {documentationData?.title}
        </div>
        {/* MOBILE TABLE OF CONTENTS */}
        <div className="block xl:hidden">
          <TableOfContentsDropdown tocData={pageTableOfContents} />
        </div>
        {/* CONTENT */}
        <div
          ref={contentRef}
          data-tina-field={tinaField(documentationData, "body")}
        >
          <TinaMarkdown
            content={documentationData?.body}
            components={MarkdownComponentMapping}
          />
        </div>
        {formattedDate && (
          <span className="text-md text-slate-500">
            {" "}
            Last Edited: {formattedDate}
          </span>
        )}
        <Pagination prevPage={previousPage} nextPage={nextPage} />
      </div>
      {/* DESKTOP TABLE OF CONTENTS */}
      {documentationData?.tocIsHidden ? null : (
        <div className={"sticky top-32 mx-8 hidden h-[calc(100vh)] xl:block"}>
          <TableOfContents
            tocItems={pageTableOfContents}
            activeids={activeIds}
          />
        </div>
      )}
    </div>
  );
}
