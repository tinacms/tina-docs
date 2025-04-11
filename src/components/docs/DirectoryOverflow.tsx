import { useEffect, useRef, useState } from "react";
import { MdMenu } from "react-icons/md";
import { DocsNavigationList } from "./DocsNavigationList";

const DirectoryOverflow = ({ tocData }) => {
  return (
    <div className="absolute z-20 bg-white mt-4 rounded-lg w-full p-6 shadow-xl animate-fade-down animate-duration-300 overflow-y-scroll h-96">
      <DocsNavigationList navItems={tocData} />
    </div>
  );
};

const DirectoryOverflowButton = ({ tocData }) => {
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
        className="cursor-pointer rounded-lg border-slate-400 bg-gradient-to-r from-white/50 to-white/30 px-4 py-2 shadow-lg"
        onClick={() => setIsTableOfContentsOpen(!isTableOfContentsOpen)}
      >
        <span className="flex items-center space-x-2 py-1">
          <MdMenu size={20} className="text-orange-500" />
          <span className="text-slate-600">Topics</span>
        </span>
      </div>
      {isTableOfContentsOpen && (
        <div className="relative w-full">
          <DirectoryOverflow tocData={tocData} />
        </div>
      )}
    </div>
  );
};

export default DirectoryOverflowButton;
