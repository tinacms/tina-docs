import { Bars3Icon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const TocOverflow = ({ tocData }) => {
  return (
    <div className="animate-fade-down animate-duration-300 absolute z-10 mt-4 max-h-96 w-full overflow-y-scroll rounded-lg bg-white p-6 shadow-lg">
      {tocData.tocData.map((item, index) => {
        const textIndentation =
          item.type === "h3" ? "ml-4" : item.type === "h4" ? "ml-8" : "";

        const linkHref = `#${item.text.replace(/\s+/g, "-").toLowerCase()}`;

        return (
          <Link
            key={index}
            href={linkHref}
            className={`block pl-6 transition-colors hover:text-orange-500 ${textIndentation} pb-1`}
          >
            {item.text}
          </Link>
        );
      })}
    </div>
  );
};

const TocOverflowButton = (tocData) => {
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
    <div>
      {tocData.tocData.length !== 0 && (
        <div className="w-full py-6" ref={containerRef}>
          <div
            className="cursor-pointer rounded-lg border-slate-400 bg-gradient-to-r from-white/50 to-white/30 px-4 py-2 shadow-lg"
            onClick={() => setIsTableOfContentsOpen(!isTableOfContentsOpen)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setIsTableOfContentsOpen(!isTableOfContentsOpen);
              }
            }}
          >
            <span className="flex items-center space-x-2">
              <Bars3Icon className="size-5 text-orange-500" />
              <span className="py-1 text-slate-600">Table of Contents</span>
            </span>
          </div>
          {isTableOfContentsOpen && (
            <div className="relative w-full">
              <TocOverflow tocData={tocData} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TocOverflowButton;
