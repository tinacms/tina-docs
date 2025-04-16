import Image from "next/image";
import { useRef, useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import MarkdownComponentMapping from "../markdown-component-mapping";
import HeaderFormat from "../standard-elements/header-format";

const Accordion = (data: {
  docText: string;
  image: string;
  heading?: string;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      // eslint-disable-next-line tailwindcss/no-arbitrary-value
      className={`mb-2 max-w-full overflow-hidden rounded-lg bg-white/40 shadow-sm transition-[width] duration-300 ease-in-out ${
        isExpanded ? "w-full" : "w-80 delay-700"
      }`}
    >
      <div
        className="flex cursor-pointer items-center justify-between px-4 py-1"
        onClick={toggleExpand}
      >
        <HeaderFormat level={6}>
          {data.heading || "Click to expand"}
        </HeaderFormat>
        <div>
          {isExpanded ? (
            <FaMinus className="size-3 text-blue-800" />
          ) : (
            <FaPlus className="size-3 text-gray-500" />
          )}
        </div>
      </div>

      <div
        // eslint-disable-next-line tailwindcss/no-arbitrary-value
        className={`grid gap-4 border-t border-gray-100 transition-all duration-700 ease-in-out ${
          isExpanded
            ? "max-h-[2000px] opacity-100 delay-500"
            : "max-h-0 overflow-hidden opacity-0"
        } ${data.image ? "sm:grid-cols-2" : ""}`}
        ref={contentRef}
      >
        <div className="p-4">
          <TinaMarkdown
            content={data.docText as any}
            components={MarkdownComponentMapping}
          />
        </div>
        {data.image && (
          <div className="p-4">
            <Image src={data.image} alt="image" className="w-full rounded-lg" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Accordion;
