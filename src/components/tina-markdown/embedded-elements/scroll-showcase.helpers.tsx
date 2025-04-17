import type React from "react";
import { useEffect, useState } from "react";

export interface Item {
  id?: string;
  offset?: number;
  level?: string;
  src?: string;
}

/** UseWindowSize Hook */
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState<{
    width: number;
    height: number;
  }>({ width: 1200, height: 800 });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    // Set initial size
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
}

/** Throttled scroll listener */
export function createListener(
  componentRef: React.RefObject<HTMLDivElement>,
  headings: Item[],
  // Callback to update active IDs - param name in type is just for documentation

  setActiveIds: (activeIds: string[]) => void
) {
  let tick = false;
  const THROTTLE_INTERVAL = 100;
  const maxScrollY = document.documentElement.scrollHeight - window.innerHeight;

  const maxScrollYRelative =
    (maxScrollY - componentRef.current.offsetTop) /
    componentRef.current.scrollHeight;

  const relativePositionHeadingMap = headings.map((heading) => {
    const relativePosition =
      1 -
      (componentRef.current.scrollHeight - (heading.offset || 0)) /
        componentRef.current.scrollHeight;

    return {
      ...heading,
      relativePagePosition:
        maxScrollYRelative > 1
          ? relativePosition
          : relativePosition * maxScrollYRelative,
    };
  });

  const throttledScroll = () => {
    if (!componentRef.current) return;
    const scrollPos =
      window.scrollY - componentRef.current.offsetTop + window.innerHeight / 6;
    const newActiveIds: string[] = [];
    const relativeScrollPosition =
      scrollPos / componentRef.current.scrollHeight;

    const activeHeadingCandidates = relativePositionHeadingMap.filter(
      (heading) => relativeScrollPosition >= heading.relativePagePosition
    );

    const activeHeading =
      activeHeadingCandidates.length > 0
        ? activeHeadingCandidates.reduce((prev, current) =>
            (prev.offset || 0) > (current.offset || 0) ? prev : current
          )
        : (headings[0] ?? {});

    newActiveIds.push(activeHeading.id || "");

    if (activeHeading.level !== "H2") {
      const activeHeadingParentCandidates =
        activeHeadingCandidates.length > 0
          ? activeHeadingCandidates.filter((h) => h.level === "H2")
          : [];
      const activeHeadingParent =
        activeHeadingParentCandidates.length > 0
          ? activeHeadingParentCandidates.reduce((prev, current) =>
              (prev.offset || 0) > (current.offset || 0) ? prev : current
            )
          : null;

      if (activeHeadingParent?.id) {
        newActiveIds.push(activeHeadingParent.id);
      }
    }
    setActiveIds(newActiveIds);
  };

  return function onScroll() {
    if (!tick) {
      setTimeout(() => {
        throttledScroll();
        tick = false;
      }, THROTTLE_INTERVAL);
    }
    tick = true;
  };
}
