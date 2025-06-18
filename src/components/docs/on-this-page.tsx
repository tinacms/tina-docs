"use client";

import { formatHeaderId } from "@/utils/docs";
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
      const anchor = formatHeaderId(item.text);
      const prefix = item.type === "h3" ? "  " : "";
      return `${prefix}- [${item.text}](#${anchor})`;
    })
    .join("\n");
};

export function getIdSyntax(text: string, index?: number) {
  const baseId = text
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^a-z0-9\-]/g, "");
  return index !== undefined ? `${baseId}-${index}` : baseId;
}

export const OnThisPage = ({ pageItems, activeids }: OnThisPageProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const tocWrapperRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    if (pageItems && pageItems.length > 0) {
      const firstItemId = getIdSyntax(pageItems[0].text, 0);
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
      const newActiveId = getIdSyntax(
        pageItems[sectionIndex].text,
        sectionIndex
      );
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
    <div
      className="mb-[-0.375rem] flex-auto break-words whitespace-normal overflow-wrap-break-word pt-6"
      data-exclude-from-md
    >
      <div
        className={`block w-full leading-5 h-auto transition-all duration-400 ease-out ${
          isOpen
            ? "max-h-[1500px] transition-all duration-750 ease-in"
            : "max-h-0 overflow-hidden"
        } lg:max-h-none`}
      >
        <span className="hidden lg:flex gap-2 text-base pb-1 bg-transparent leading-none text-brand-primary">
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
          {pageItems.map((item, index) => {
            const uniqueId = getIdSyntax(item.text, index);
            return (
              <div className="flex gap-2 font-light group" key={uniqueId}>
                <div
                  className={`border-r border-1  ${
                    activeId === uniqueId
                      ? "border-brand-primary"
                      : "border-neutral-border-subtle group-hover:border-neutral-border"
                  }`}
                />
                <a
                  href={`#${uniqueId}`}
                  onClick={(e) => handleLinkClick(e, uniqueId)}
                  className={`${item.type === "h3" ? "pl-6" : "pl-2"} py-1.5 ${
                    activeId === uniqueId
                      ? "text-brand-primary"
                      : "group-hover:text-neutral-text text-neutral-text-secondary"
                  }`}
                >
                  {item.text}
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
