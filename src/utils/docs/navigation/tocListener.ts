"use client";

/**
 * Utilities for tracking active table of contents items during page scroll
 */
import { type RefObject, useEffect, useRef, useState } from "react";

interface Heading {
  id?: string;
  offset?: number;
  level?: string;
}

/**
 * Creates an array of heading elements from the content div
 *
 * @param contentRef - Reference to the content container element
 * @returns Array of heading objects with id, offset, and level properties
 */
function createHeadings(
  contentRef: RefObject<HTMLDivElement | null>
): Heading[] {
  const headings: Heading[] = [];
  const htmlElements = contentRef.current?.querySelectorAll(
    "h1, h2, h3, h4, h5, h6"
  );

  for (const heading of htmlElements ?? []) {
    headings.push({
      id: heading.id,
      offset: heading.offsetTop,
      level: heading.tagName,
    });
  }
  return headings;
}

/**
 * Creates a scroll listener function that updates active ToC items
 *
 * @param contentRef - Reference to the content container element
 * @param setActiveIds - Callback function to update active heading IDs
 * @returns A scroll handler function
 */
export function createTocListener(
  contentRef: RefObject<HTMLDivElement | null>,
  setActiveIds: (activeIds: string[]) => void
): () => void {
  const headings = createHeadings(contentRef);

  return function onScroll(): void {
    const scrollPos = window.scrollY + window.innerHeight / 4; // Adjust for active detection
    const documentHeight = document.documentElement.scrollHeight;
    const activeIds: string[] = [];

    // If we're near the bottom of the page, include the last headings
    const isNearBottom =
      window.scrollY + window.innerHeight >= documentHeight - 50;

    for (const heading of headings) {
      if (heading.offset && (scrollPos >= heading.offset || isNearBottom)) {
        activeIds.push(heading.id ?? "");
      }
    }

    setActiveIds(activeIds);
  };
}

/**
 * React hook for tracking active headings during page scroll
 *
 * @param data - Document data (optional, included for potential future use)
 * @returns Object with content reference and active heading IDs
 */
export function useTocListener(data?: any) {
  const [activeIds, setActiveIds] = useState<string[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;
    const tocListener = createTocListener(contentRef, setActiveIds);
    const handleScroll = () => tocListener(); // Define scroll handler

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initialize active IDs on mount

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return { contentRef, activeIds };
}
