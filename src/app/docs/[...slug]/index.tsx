"use client";

import { CopyPageDropdown } from "@/components/copy-page-dropdown";
import { BreadCrumbs } from "@/components/docs/breadcrumbs";
import { useNavigation } from "@/components/docs/layout/navigation-context";
import { OnThisPage } from "@/components/docs/on-this-page";
import MarkdownComponentMapping from "@/components/tina-markdown/markdown-component-mapping";
import { Pagination } from "@/components/ui/pagination";
import GitHubMetadata from "@/src/components/page-metadata/github-metadata";
import { formatDate, useTocListener } from "@/utils/docs";
import { tinaField } from "tinacms/dist/react";
import { TinaMarkdown } from "tinacms/dist/rich-text";

export default function Document({ props, tinaProps }) {
  const { data } = tinaProps;
  const navigationData = useNavigation();

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
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-docs-layout">
      <div
        className={`mx-auto max-w-3xl w-full overflow-hidden ${
          !documentationData?.tocIsHidden ? "xl:col-span-1" : ""
        }`}
      >
        <div className="overflow-hidden break-words mx-8 mt-2 md:mt-0">
          <BreadCrumbs navigationDocsData={navigationData} />
          <div className="flex flex-row items-center justify-between w-full gap-2">
            <h1
              className="text-brand-primary my-4 font-heading text-4xl"
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
          <GitHubMetadata path={documentationData?.id} />

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
      </div>
      {/* DESKTOP TABLE OF CONTENTS */}
      {documentationData?.tocIsHidden ? null : (
        <div
          className={
            "sticky hidden xl:block  top-4 h-fit mx-4 w-64 justify-self-end"
          }
        >
          <OnThisPage pageItems={pageTableOfContents} activeids={activeIds} />
        </div>
      )}
    </div>
  );
}
