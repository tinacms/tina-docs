"use client";

import { getDocId } from "@/utils/docs/getDocsIds";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { MdMenu } from "react-icons/md";

interface TocProps {
  tocItems: Array<{ type: string; text: string }>;
  activeids: string[];
}

export const generateMarkdown = (
  tocItems: Array<{ type: string; text: string }>
) => {
  return tocItems
    .map((item) => {
      const anchor = getDocId(item.text);
      const prefix = item.type === "h3" ? "  " : "";
      return `${prefix}- [${item.text}](#${anchor})`;
    })
    .join("\n");
};

// Helper function to convert text to a valid HTML ID
export function getIdSyntax(text: string) {
  return text.toLowerCase().replace(/ /g, "-");
}

export const TableOfContents = ({ tocItems, activeids }: TocProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const tocWrapperRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const close = () => setIsOpen(false);
    const allLinks = document.querySelectorAll("a");
    for (const a of Array.from(allLinks)) {
      a.addEventListener("click", close);
    }

    return () => {
      for (const a of Array.from(allLinks)) {
        a.removeEventListener("click", close);
      }
    };
  }, []);

  useEffect(() => {
    if (tocWrapperRef.current && activeids?.length > 0) {
      const tocList = tocWrapperRef.current;
      const lastActiveId = activeids[activeids.length - 1];
      const activeLink = tocList.querySelector(`a[href="#${lastActiveId}"]`);
      setActiveId(lastActiveId);

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

  //needed for the smooth scroll
  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });

      window.history.pushState(null, "", `#${id}`);
    }
  };

  if (!tocItems || tocItems.length === 0) {
    return null;
  }
  // console.log(activeId);
  console.log('tocItems', tocItems);
  // console.log(activeids);

  return (
    <div className="mb-[-0.375rem] flex-auto w-[300px] break-words whitespace-normal overflow-wrap-break-word lg:sticky lg:top-32">
      <div
        className={`block w-full leading-5 h-auto transition-all duration-400 ease-out ${
          isOpen
            ? "max-h-[1500px] transition-all duration-750 ease-in"
            : "max-h-0 overflow-hidden"
        } lg:max-h-none`}
      >
        <span className=" hidden lg:flex gap-2 text-base text-[var(--color-secondary)] pb-1 bg-transparent leading-none">
          On this page
        </span>
        <div
          ref={tocWrapperRef}
          className="max-h-[70vh] overflow-y-auto px-1 py-2 2xl:max-h-[75vh]"
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
          {tocItems.map((item) => (
            <div className="flex gap-2 font-light group" key={getIdSyntax(item.text)}>
              <div
                className={`border-r border-1 border-gray-200 ${
                  activeId === getIdSyntax(item.text) ? "border-orange-500" : "group-hover:border-neutral-500"
                }`}
              ></div>
              <a
                href={`#${getIdSyntax(item.text)}`}
                onClick={(e) => handleLinkClick(e, getIdSyntax(item.text))}
                className={`${
                  item.type === "h3" ? "pl-4" : "pl-2"
                } py-1.5 text-gray-400 ${
                  activeId === getIdSyntax(item.text) ? "text-orange-500" : "group-hover:text-black"
                }`}
              >
                {item.text}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
