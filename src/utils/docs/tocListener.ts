import React from "react";

interface Heading {
  id?: string;
  offset?: number;
  level?: string;
}

function createHeadings(
  contentRef: React.RefObject<HTMLDivElement | null>
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

export function createTocListener(
  contentRef: React.RefObject<HTMLDivElement | null>,
  setActiveIds: (activeIds: string[]) => void
): () => void {
  const headings = createHeadings(contentRef);

  return function onScroll(): void {
    const scrollPos = window.scrollY + window.innerHeight / 4; // Adjust for active detection
    const activeIds: string[] = [];

    for (const heading of headings) {
      if (heading.offset && scrollPos >= heading.offset) {
        activeIds.push(heading.id ?? "");
      }
    }

    setActiveIds(activeIds);
  };
}

export function useTocListener(data: any) {
  const [activeIds, setActiveIds] = React.useState<string[]>([]);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
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
