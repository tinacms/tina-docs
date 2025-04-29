import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useRef, useState } from "react";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import MarkdownComponentMapping from "../markdown-component-mapping";


const Accordion = ({
  docText,
  image,
  heading,
  fullWidth = false,
}: {
  docText: string;
  image: string;
  heading?: string;
  fullWidth?: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="flex flex-col gap-2 justify-center items-center">
<div
      className={`mb-2 max-w-full overflow-hidden rounded-lg bg-white/40 shadow-sm transition-[width] duration-300 ease-in-out ${fullWidth ? "w-full" : "w-3/4"}`}
    >
      <div
        className="flex cursor-pointer items-center justify-between px-4 py-1"
        onClick={toggleExpand}
      >
        <h4 className="text-black text-base font-tuner mt-2 mb-1">
          {heading || "Click to expand"}
        </h4>
        <div>
          {isExpanded ? (
            <MinusIcon className="size-5 text-black" />
          ) : (
            <PlusIcon className="size-5 text-black" />
          )}
        </div>
      </div>

      <div
        className={`grid gap-4 border-t border-gray-100 transition-all duration-300 ease-in-out ${
          isExpanded
            ? "max-h-[2000px] opacity-100"
            : "max-h-0 overflow-hidden opacity-0"
        } ${image ? "sm:grid-cols-2" : ""}`}
        ref={contentRef}
      >
        <div className="p-4">
          <TinaMarkdown
            content={docText as any}
            components={MarkdownComponentMapping}
          />
        </div>
        {image && (
          <div className="p-4">
            <Image
              src={image}
              alt="image"
              className="rounded-lg"
              width={500}
              height={500}
            />
          </div>
        )}
      </div>
    </div>
    </div>
    
  );
};

export default Accordion;
