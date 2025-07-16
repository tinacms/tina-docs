import { ChevronDownIcon } from "@heroicons/react/24/outline";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import CodeBlockWithHighlightLines from "./recipe.helpers";

// Skeleton components
const CodeBlockSkeleton = () => (
  <div className="codeblock-container h-full flex flex-col">
    <div className="sticky top-0 z-30">
      <div className="flex items-center justify-between w-full border-b border-neutral-border-subtle h-full">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24 mx-6" />
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16 mr-2" />
      </div>
    </div>
    <div className="w-full flex-1 bg-background-brand-code py-5 px-2 text-sm border border-neutral-border-subtle/50 shadow-sm rounded-b-xl lg:rounded-bl-none md:rounded-br-xl h-full">
      <div className="space-y-3">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-8" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex-1" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const InstructionsSkeleton = () => (
  <div>
    {[...Array(2)].map((_, i) => (
      <div
        key={i}
        className="bg-gray-800 p-4 border border-neutral-border-subtle border-x-0 first:border-t-0 last:border-b-0"
      >
        <div className="h-4 bg-gray-600 rounded animate-pulse w-1/2" />
      </div>
    ))}
  </div>
);

const MIN_INSTRUCTIONS_HEIGHT = 60;

export const RecipeBlock = (data: {
  title?: string;
  description?: string;
  codeblock?: any;
  code?: string;
  instruction?: any;
}) => {
  const { title, description, codeblock, code, instruction } = data;

  const [highlightLines, setHighlightLines] = useState("");
  const [clickedInstruction, setClickedInstruction] = useState<number | null>(
    null
  );
  const [codeHeight, setCodeHeight] = useState<number | null>(null);
  const [isBottomOfInstructions, setIsBottomOfInstructions] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const codeblockRef = useRef<HTMLDivElement>(null);
  const codeContentRef = useRef<HTMLDivElement>(null);
  const instructionBlockRefs = useRef<HTMLDivElement>(null);
  const instructionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Set initial height after a delay to ensure content is rendered
    const timer = setTimeout(() => {
      if (codeContentRef.current) {
        const height = Math.round(codeContentRef.current.offsetHeight);
        setCodeHeight(height);
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    // Set initial value
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Monitor code content height changes
  useEffect(() => {
    if (!codeContentRef.current) return;

    let timeoutId: NodeJS.Timeout;
    let lastHeight = 0;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newHeight = entry.contentRect.height;

        // Only update if height changed significantly (more than 10px)
        if (Math.abs(newHeight - lastHeight) > 10) {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            setCodeHeight(Math.round(newHeight));
            lastHeight = newHeight;
          }, 100);
        }
      }
    });

    resizeObserver.observe(codeContentRef.current);

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const isInsideInstructions = target.closest(".instructions");

      if (!isInsideInstructions && clickedInstruction !== null) {
        setClickedInstruction(null);
        setHighlightLines("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [clickedInstruction]);

  const checkIfBottom = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollHeight, scrollTop, clientHeight } = event.currentTarget;
    setIsBottomOfInstructions(scrollHeight - scrollTop <= clientHeight + 10);
  };

  const handleInstructionClick = (
    index: number,
    codeLineStart?: number,
    codeLineEnd?: number
  ) => {
    setHighlightLines(`${codeLineStart}-${codeLineEnd}`);
    setClickedInstruction(index === clickedInstruction ? null : index);

    const linePixelheight = 24;
    // gives the moving logic some breathing room
    const linePixelBuffer = 15;

    if (codeblockRef.current) {
      codeblockRef.current.scrollTo({
        top: linePixelheight * (codeLineStart || 0) - linePixelBuffer,
        behavior: "smooth",
      });
    }

    // On mobile, scroll to instruction
    if (isMobile && instructionRefs.current[index]) {
      instructionRefs.current[index].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  };

  const handleDownArrowClick = () => {
    const lastInstruction =
      instructionRefs.current[instructionRefs.current.length - 1];
    if (lastInstruction) {
      lastInstruction.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  };

  const calculateInstructionsHeight = () => {
    return instructionRefs.current.reduce((total, ref) => {
      return total + (ref?.offsetHeight || 0);
    }, 0);
  };

  const getInstructionsHeight = () => {
    // Mobile: Use reasonable max height
    if (isMobile) {
      return "300px"; // Fixed reasonable height for mobile
    }

    // Desktop: Match code height but with minimum
    if (codeHeight && codeHeight > MIN_INSTRUCTIONS_HEIGHT) {
      return `${codeHeight + 2}px`;
    }

    return "auto";
  };

  const checkIfScrollable = () => {
    const instructionsHeight = calculateInstructionsHeight();

    if (isMobile) {
      return instructionsHeight >= 300; // Mobile fixed height
    }

    return instructionsHeight > (codeHeight || 0);
  };

  return (
    <div className="recipe-block-container relative w-full">
      <div className="title-description">
        {title && (
          <h2 className="text-2xl font-medium brand-primary-gradient mb-2 font-heading">
            {title}
          </h2>
        )}
        {description && (
          <p className="text-neutral-text font-light mb-5 font-body">
            {description}
          </p>
        )}
      </div>

      <div className="content-wrapper flex flex-col lg:flex-row rounded-2xl overflow-hidden border border-neutral-border shadow-md">
        <div
          className="instructions relative flex shrink-0 flex-col bg-neutral-background-secondary lg:w-1/3 lg:border-r lg:border-b-0 border-b border-neutral-border"
          ref={instructionBlockRefs}
          style={{
            height: getInstructionsHeight(),
            maxHeight: isMobile ? "300px" : "none",
          }}
        >
          <div
            className={`${
              isBottomOfInstructions ||
              instruction?.length === 0 ||
              !instruction ||
              !checkIfScrollable()
                ? "opacity-0"
                : ""
            } absolute bottom-0 left-0 right-0 z-10 transition-all duration-300 pointer-events-none`}
          >
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black to-transparent opacity-60" />
            <ChevronDownIcon className="absolute bottom-4 left-1/2 size-7 -translate-x-1/2 text-xl text-white" />
          </div>

          <div className="flex-1 overflow-auto" onScroll={checkIfBottom}>
            <div
              className={`transition-opacity duration-300 ${
                isLoading ? "opacity-100" : "opacity-0"
              }`}
            >
              {isLoading && <InstructionsSkeleton />}
            </div>
            <div
              className={`transition-opacity duration-300 ${
                isLoading ? "opacity-0" : "opacity-100"
              }`}
            >
              {!isLoading &&
                (instruction?.map((inst, idx) => (
                  <div
                    key={`instruction-${idx}`}
                    ref={(element) => {
                      instructionRefs.current[idx] = element;
                    }}
                    className={`instruction-item cursor-pointer bg-neutral-background-secondary p-4 text-neutral-text border border-neutral-border-subtle border-x-0 first:border-t-0 last:border-b-0 last:rounded-bl-none
                  ${clickedInstruction === idx ? "bg-brand-primary-contrast" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInstructionClick(
                        idx,
                        inst.codeLineStart,
                        inst.codeLineEnd
                      );
                    }}
                  >
                    <h5 className="font-light">{`${idx + 1}. ${
                      inst.header || "Default Header"
                    }`}</h5>
                    <div
                      className={`overflow-auto transition-all ease-in-out ${
                        clickedInstruction === idx
                          ? "max-h-full opacity-100 duration-500"
                          : "max-h-0 opacity-0 duration-0"
                      }`}
                    >
                      <p className="mt-2 text-sm text-neutral-text-secondary leading-relaxed">
                        {inst.itemDescription || "Default Item Description"}
                      </p>
                    </div>
                  </div>
                )) || (
                  <p className="p-4 text-neutral-text-secondary py-4">
                    No instructions available.
                  </p>
                ))}
            </div>
          </div>
        </div>

        <div
          ref={codeblockRef}
          className="flex flex-col z-10 h-full lg:w-2/3 py-0 bg-neutral-background overflow-auto"
        >
          <div ref={codeContentRef}>
            <div
              className={`transition-opacity duration-300 ${
                isLoading ? "opacity-100" : "opacity-0"
              }`}
            >
              {isLoading && <CodeBlockSkeleton />}
            </div>
            <div
              className={`transition-opacity duration-300 ${
                isLoading ? "opacity-0" : "opacity-100"
              }`}
            >
              {!isLoading &&
                (code ? (
                  <CodeBlockWithHighlightLines
                    value={code.replaceAll("�", " ")}
                    lang="javascript"
                    highlightLines={highlightLines}
                  />
                ) : codeblock ? (
                  <TinaMarkdown
                    content={codeblock}
                    components={{
                      code_block: (props) => (
                        <CodeBlockWithHighlightLines
                          {...props}
                          highlightLines={highlightLines}
                        />
                      ),
                    }}
                  />
                ) : (
                  <p className="p-4">No code block available.</p>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeBlock;
