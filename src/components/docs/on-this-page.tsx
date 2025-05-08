"use client";

import { getDocId } from "@/utils/docs/getDocsIds";
import { useMotionValueEvent, useScroll } from "motion/react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface OnThisPageProps {
  pageItems: Array<{ type: string; text: string }>;
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

export function getIdSyntax(text: string) {
  return text
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^a-z0-9\-]/g, "");
}

export const OnThisPage = ({ pageItems, activeids }: OnThisPageProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const tocWrapperRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    if (pageItems && pageItems.length > 0) {
      const firstItemId = getIdSyntax(pageItems[0].text);
      setActiveId(firstItemId);
    }
  }, [pageItems]);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (pageItems.length === 0 || isUserScrolling) return;

    const sectionIndex = Math.min(
      Math.floor(latest * pageItems.length),
      pageItems.length - 1
    );

    if (sectionIndex >= 0) {
      const newActiveId = getIdSyntax(pageItems[sectionIndex].text);
      setActiveId(newActiveId);
    }
  });

  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      window.history.pushState(null, "", `#${id}`);
      setActiveId(id);
      setIsUserScrolling(true);

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        setIsUserScrolling(false);
      }, 1000);
    }
  };

  if (!pageItems || pageItems.length === 0) {
    return null;
  }

  return (
    <div className="mb-[-0.375rem] flex-auto break-words whitespace-normal overflow-wrap-break-word pt-6">
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
          className="max-h-[70vh] py-2 2xl:max-h-[75vh]"
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
          {pageItems.map((item) => (
            <div
              className="flex gap-2 font-light group"
              key={getIdSyntax(item.text)}
            >
              <div
                className={`border-r border-1 border-gray-200 ${
                  activeId === getIdSyntax(item.text)
                    ? "border-orange-500"
                    : "group-hover:border-neutral-500"
                }`}
              />
              <a
                href={`#${getIdSyntax(item.text)}`}
                onClick={(e) => handleLinkClick(e, getIdSyntax(item.text))}
                className={`${
                  item.type === "h3" ? "pl-7" : "pl-2"
                } py-1.5 text-gray-500 ${
                  activeId === getIdSyntax(item.text)
                    ? "text-orange-500"
                    : "group-hover:text-black"
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
