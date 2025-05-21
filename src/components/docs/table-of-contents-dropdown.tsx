import { Bars3Icon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import { getIdSyntax } from "./on-this-page";

const TableOfContentsItems = ({ tocData }) => {
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

  return (
    <div className="animate-fade-down animate-duration-300 absolute z-10 mt-4 max-h-96 w-full overflow-y-scroll rounded-lg bg-white p-6 shadow-lg">
      {tocData?.map((item) => (
        <div
          className="flex gap-2 font-light group"
          key={getIdSyntax(item.text)}
        >
          <div
            className={`border-r border-1 border-gray-200 group-hover:border-neutral-500
            `}
          />
          <a
            href={`#${getIdSyntax(item.text)}`}
            onClick={(e) => handleLinkClick(e, getIdSyntax(item.text))}
            className={`${
              item.type === "h3" ? "pl-4" : "pl-2"
            } py-1.5 text-gray-400 group-hover:text-black`}
          >
            {item.text}
          </a>
        </div>
      ))}
    </div>
  );
};

export const TableOfContentsDropdown = ({ tocData }) => {
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
    <div data-exclude-from-md>
      {tocData?.tocData?.length !== 0 && (
        <div className="w-full py-6" ref={containerRef}>
          <div
            className="cursor-pointer rounded-lg border-neutral-border brand-glass-gradient  px-4 py-2 shadow-lg"
            onClick={() => setIsTableOfContentsOpen(!isTableOfContentsOpen)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setIsTableOfContentsOpen(!isTableOfContentsOpen);
              }
            }}
          >
            <span className="flex items-center space-x-2">
              <Bars3Icon className="size-5 text-brand-primary" />
              <span className="py-1 text-neutral-text">On this page</span>
            </span>
          </div>
          {isTableOfContentsOpen && (
            <div className="relative w-full">
              <TableOfContentsItems tocData={tocData} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
