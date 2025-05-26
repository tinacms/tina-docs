"use client";

import { CopyPageDropdown } from "@/components/copy-page-dropdown";
import { TableOfContentsDropdown } from "@/components/docs/table-of-contents-dropdown";
import MarkdownComponentMapping from "@/components/tina-markdown/markdown-component-mapping";
import { OnThisPage } from "@/src/components/docs/on-this-page";
import { Pagination } from "@/src/components/ui/pagination";
import { formatDate, useTocListener } from "@/utils/docs";
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

  // Table of Contents Listener to Highlight Active Section
  const { activeIds, contentRef } = useTocListener(documentationData);

  return (
    // 73.5% of 100% is ~ 55% of the screenwidth in parent div
    // 26.5% of 100% is ~ 20% of the screenwidth in parent div
    <div className="grid grid-cols-1 xl:grid-cols-[73.5%_26.5%] pr-4">
      <div
        className={`max-w-full overflow-hidden break-words  ${
          !documentationData?.tocIsHidden ? "xl:col-span-1" : ""
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between w-full gap-2">
          <h1
            className="brand-primary-gradient py-4 font-tuner text-4xl"
            data-tina-field={tinaField(documentationData, "title")}
            data-pagefind-meta="title"
          >
            {documentationData?.title}
          </h1>
          <CopyPageDropdown className="self-end mb-2 md:mb-0" />
        </div>
        {/* MOBILE TABLE OF CONTENTS */}
        {documentationData?.tocIsHidden ? null : (
          <div className="block xl:hidden">
            <TableOfContentsDropdown tocData={pageTableOfContents} />
          </div>
        )}
        {/* CONTENT */}
        <div
          ref={contentRef}
          data-tina-field={tinaField(documentationData, "body")}
          className="pt-4"
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
        <div className={"sticky hidden xl:block  top-4 h-screen mx-4"}>
          <OnThisPage pageItems={pageTableOfContents} activeids={activeIds} />
        </div>
      )}
    </div>
  );
}
