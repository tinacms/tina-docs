/* eslint-disable tailwindcss/no-arbitrary-value */
/* eslint-disable tailwindcss/no-custom-classname */

"use client";

import { getDocId } from "@/utils/docs/getDocsIds";
import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

interface TocProps {
  tocItems: Array<{ type: string; text: string }>;
  activeids: string[];
}

export const generateMarkdown = (
  tocItems: Array<{ type: string; text: string }>,
) => {
  return tocItems
    .map((item) => {
      const anchor = getDocId(item.text);
      const prefix = item.type === "h3" ? "  " : "";
      return `${prefix}- [${item.text}](#${anchor})`;
    })
    .join("\n");
};

const ToC = ({ tocItems, activeids }: TocProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const tocWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = () => setIsOpen(false);
    const allLinks = document.querySelectorAll("a");
    allLinks.forEach((a) => a.addEventListener("click", close));

    return () => {
      allLinks.forEach((a) => a.removeEventListener("click", close));
    };
  }, []);

  useEffect(() => {
    if (tocWrapperRef.current && activeids?.length > 0) {
      const tocList = tocWrapperRef.current;

      const lastActiveId = activeids[activeids.length - 1];
      const activeLink = tocList.querySelector(`a[href="#${lastActiveId}"]`);

      if (activeLink) {
        const activeTop = (activeLink as HTMLElement).offsetTop;
        const activeHeight = (activeLink as HTMLElement).offsetHeight;
        const listHeight = tocList.clientHeight;

        tocList.scrollTo({
          top: activeTop - listHeight / 2 + activeHeight / 2,
          behavior: "smooth",
        });
      }
    }
  }, [activeids]);

  if (!tocItems || tocItems.length === 0) {
    return null;
  }

  const tocMarkdown = generateMarkdown(tocItems);

  return (
    <div className="flex-0 overflow-wrap-break-word -mb-1.5 w-[300px] flex-auto whitespace-normal break-words lg:sticky lg:top-32">
      <div
        className={`duration-400 block h-auto w-full leading-5 transition-all ease-out ${
          isOpen
            ? "duration-750 max-h-[1500px] transition-all ease-in"
            : "max-h-0 overflow-hidden"
        } lg:max-h-none`}
      >
        <span className="mb-[1.125rem] hidden bg-transparent text-base leading-none text-[var(--color-secondary)] opacity-50 lg:block">
          Table of Contents
        </span>
        <div
          ref={tocWrapperRef}
          className="max-h-[70vh] overflow-y-auto p-4 2xl:max-h-[75vh]"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            wordWrap: "break-word",
            whiteSpace: "normal",
            overflowWrap: "break-word",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent, black 5%, black 95%, transparent)",
            maskImage:
              "linear-gradient(to bottom, transparent, black 5%, black 95%, transparent)",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
          }}
        >
          <ReactMarkdown
            components={{
              ul: ({ children }) => (
                <ul className="m-0 flex list-none flex-col flex-wrap space-y-1 p-0 pt-1">
                  {children}
                </ul>
              ),
              li: ({ children }) => (
                <li className="m-0 py-1.5 leading-relaxed">{children}</li>
              ),
              a: ({ children, ...props }) => {
                const isActive = activeids?.includes(
                  props.href?.slice(1) || "",
                );
                return (
                  <a
                    {...props}
                    className={`
                      block rounded-md px-2 py-1 transition-colors duration-150 hover:bg-gray-50/75
                      ${
                        isActive
                          ? "font-medium text-orange-500 no-underline"
                          : "text-gray-600 hover:text-orange-500"
                      }`}
                  >
                    {children}
                  </a>
                );
              },
            }}
          >
            {tocMarkdown}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default ToC;
