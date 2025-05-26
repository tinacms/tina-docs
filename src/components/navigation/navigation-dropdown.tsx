"use client";

import { Bars3Icon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import { DocsNavigationItems } from "./navigation-items";

const NavigationDropdownContent = ({ tocData }) => {
  return (
    <div className="animate-fade-down animate-duration-300 absolute z-20 mt-4 h-96 w-full overflow-y-scroll rounded-lg bg-white p-6 shadow-xl">
      <DocsNavigationItems navItems={tocData} />
    </div>
  );
};

export const NavigationDropdown = ({ tocData }: { tocData: any }) => {
  const [isTableOfContentsOpen, setIsTableOfContentsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsTableOfContentsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full pb-6" ref={containerRef}>
      <div
        className="cursor-pointer rounded-lg border-neutral-border brand-glass-gradient px-4 py-2 shadow-lg"
        onClick={() => setIsTableOfContentsOpen(!isTableOfContentsOpen)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsTableOfContentsOpen(!isTableOfContentsOpen);
          }
        }}
      >
        <span className="flex items-center space-x-2 py-1">
          <Bars3Icon className="size-5 text-brand-primary" />
          <span className="text-neutral-text">Topics</span>
        </span>
      </div>
      {isTableOfContentsOpen && (
        <div className="relative w-full">
          <NavigationDropdownContent
            tocData={Array.isArray(tocData.items) ? tocData.items : []}
          />
        </div>
      )}
    </div>
  );
};
