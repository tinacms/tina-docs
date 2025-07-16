"use client";

import { formatHeaderId } from "@/utils/docs";
import { useMotionValueEvent, useScroll } from "motion/react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface OnThisPageProps {
  pageItems: Array<{ type: string; text: string }>;
  activeids: string[];
}

const PAGE_TOP_SCROLL_THRESHOLD = 0.05;

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

export const OnThisPage = ({ pageItems }: OnThisPageProps) => {
  const tocWrapperRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    if (pageItems && pageItems.length > 0) {
      // Start with Overview active (null) when page loads
      setActiveId(null);
    }
  }, [pageItems]);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (pageItems.length === 0 || isUserScrolling) return;

    // If we're at the very top, show Overview as active
    if (latest < PAGE_TOP_SCROLL_THRESHOLD) {
      setActiveId(null);
      return;
    }

    // Get header positions and normalize them to match the motion value (0-1)
    const documentHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    let newActiveId: string | null = null;

    // Build list of headers with actual positions
    const headersWithPositions = pageItems
      .map((item, index) => {
        const headerId = formatHeaderId(item.text);
        const element = headerId ? document.getElementById(headerId) : null;
        return {
          id: getIdSyntax(item.text, index),
          element,
          offsetTop: element ? element.offsetTop : 0,
          index,
        };
      })
      .filter((header) => header.element);

    // Calculate raw normalized positions, then rescale to ensure all headers are reachable
    const rawPositions = headersWithPositions.map(
      (h) => h.offsetTop / documentHeight
    );
    const maxRawPosition = Math.max(...rawPositions);
    const scaleFactor = maxRawPosition > 0.95 ? 0.95 / maxRawPosition : 1;

    const headers = headersWithPositions.map((header, idx) => ({
      ...header,
      normalizedPosition: rawPositions[idx] * scaleFactor,
    }));

    // Find the active header based on normalized scroll position
    for (let i = headers.length - 1; i >= 0; i--) {
      const header = headers[i];
      if (header.normalizedPosition <= latest) {
        newActiveId = header.id;
        break;
      }
    }

    // If no header is found, use the first one if we're past the top threshold
    if (
      !newActiveId &&
      headers.length > 0 &&
      latest > PAGE_TOP_SCROLL_THRESHOLD
    ) {
      newActiveId = headers[0].id;
    }

    setActiveId(newActiveId);
  });

  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string,
    fragment: string
  ) => {
    e.preventDefault();
    const element = document.getElementById(fragment);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 45,
        behavior: "smooth",
      });
      window.history.pushState(null, "", `#${fragment}`);
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

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.history.pushState(null, "", window.location.pathname);
    setActiveId(null);
    setIsUserScrolling(true);

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false);
    }, 1000);
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
        className={
          "block w-full leading-5 h-auto transition-all duration-400 ease-out max-h-0 overflow-hidden lg:max-h-none"
        }
      >
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
          <div className="hidden lg:flex gap-2 font-light group">
            <div
              className={`border-r border-1 ${
                activeId === null
                  ? "border-brand-primary"
                  : "border-neutral-border-subtle group-hover:border-neutral-border"
              }`}
            />
            <button
              type="button"
              onClick={handleBackToTop}
              className={`pl-2 py-1.5 ${
                activeId === null
                  ? "text-brand-primary"
                  : "group-hover:text-neutral-text text-neutral-text-secondary"
              } text-left`}
            >
              Overview
            </button>
          </div>
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
                  onClick={(e) =>
                    handleLinkClick(
                      e,
                      uniqueId,
                      formatHeaderId(item.text) || ""
                    )
                  }
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
