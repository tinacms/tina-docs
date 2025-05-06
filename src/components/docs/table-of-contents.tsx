"use client";

import { getDocId } from "@/utils/docs/getDocsIds";
import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import {useMotionValueEvent, useScroll} from "motion/react";

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

export const TableOfContents = ({ tocItems, activeids }: TocProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const tocWrapperRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const [scrollActiveId, setScrollActiveId] = useState<string | null>(null);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (tocItems.length === 0) return;
    
    const sectionIndex = Math.min(
      Math.floor(latest * tocItems.length),
      tocItems.length - 2
    );
    
    if (sectionIndex >= 0) {
      const newActiveId = getDocId(tocItems[sectionIndex].text);
      console.log("newActiveId", newActiveId);
      if (newActiveId !== scrollActiveId) {
        setScrollActiveId(newActiveId);
      }
    }
  });

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

  if (!tocItems || tocItems.length === 0) {
    return null;
  }

  const tocMarkdown = generateMarkdown(tocItems);

  return (
    <div className="mb-[-0.375rem] flex-auto w-[300px] break-words whitespace-normal overflow-wrap-break-word lg:sticky lg:top-32">
      <div
        className={`block w-full leading-5 h-auto transition-all duration-400 ease-out ${
          isOpen
            ? "max-h-[1500px] transition-all duration-750 ease-in"
            : "max-h-0 overflow-hidden"
        } lg:max-h-none`}
      >
        <span className="hidden lg:block text-base text-[var(--color-secondary)] opacity-50 bg-transparent leading-none mb-[1.125rem]">
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
                <ul className="space-y-1 pt-1 list-none p-0 m-0 flex flex-col flex-wrap">
                  {children}
                </ul>
              ),
              li: ({ children }) => (
                <li className="leading-relaxed m-0 py-[0.375rem]">
                  {children}
                </li>
              ),
              a: ({ children, ...props }) => {
                const itemId = props.href?.slice(1) || "";
                const isActiveFromIntersection = activeids?.includes(itemId);
                const isActiveFromScroll = scrollActiveId === itemId;
                const isActive = isActiveFromIntersection || isActiveFromScroll;
                
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
              }
            }}
          >
            {tocMarkdown}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};
