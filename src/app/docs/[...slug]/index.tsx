"use client";

import { CopyPageDropdown } from "@/components/copy-page-dropdown";
import { OnThisPage } from "@/components/docs/on-this-page";
import MarkdownComponentMapping from "@/components/tina-markdown/markdown-component-mapping";
import { Pagination } from "@/components/ui/pagination";
import { formatDate, useTocListener } from "@/utils/docs";
import { tinaField } from "tinacms/dist/react";
import { TinaMarkdown } from "tinacms/dist/rich-text";

export default function Document({ props, tinaProps }) {
  const { data } = tinaProps;

  const documentationData = data.docs;
  const { pageTableOfContents } = props;

  const formattedDate = formatDate(documentationData?.last_edited);

  // Table of Contents Listener to Highlight Active Section
  const { activeIds, contentRef } = useTocListener(documentationData);

  return (
    <div className="flex flex-col xl:flex-row gap-4 lg:max-w-[calc(100vw-420px)] items-center xl:items-start mx-8">
      <div className="max-w-3xl overflow-hidden break-words xl:mx-auto w-full">
        <div className="flex flex-col-reverse lg:flex-row lg:items-center justify-between w-full gap-2">
          <h1
            className="text-brand-primary my-4 text-4xl"
            data-tina-field={tinaField(documentationData, "title")}
            data-pagefind-meta="title"
          >
            {documentationData?.title
              ? documentationData.title.charAt(0).toUpperCase() +
                documentationData.title.slice(1)
              : documentationData?.title}
          </h1>
          <CopyPageDropdown className="self-end mb-2 md:mb-0" />
        </div>
        {/* CONTENT */}
        <div
          ref={contentRef}
          data-tina-field={tinaField(documentationData, "body")}
          className="mt-4 font-body font-light leading-normal tracking-normal"
        >
          <TinaMarkdown
            content={documentationData?.body}
            components={MarkdownComponentMapping}
          />
        </div>
        {formattedDate && (
          <span className="text-md text-slate-500 font-body font-light">
            {" "}
            Last Edited: {formattedDate}
          </span>
        )}
        <Pagination />
      </div>
      {/* DESKTOP TABLE OF CONTENTS */}

      <div className={"sticky hidden xl:block  top-4 h-fit mx-4 min-w-64"}>
        {documentationData?.tocIsHidden ? null : (
          <OnThisPage pageItems={pageTableOfContents} activeids={activeIds} />
        )}
      </div>
    </div>
  );
}
