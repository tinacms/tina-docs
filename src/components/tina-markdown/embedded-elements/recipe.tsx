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
const MD_BREAKPOINT = 768;

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
  //LHSheight is the height used for the instructions block when the screen is >= 1024px
  const [LHSheight, setLHSheight] = useState<string | null>(null);
  const [isBottomOfInstructions, setIsBottomOfInstructions] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  const codeblockRef = useRef<HTMLDivElement>(null);
  const codeContentRef = useRef<HTMLDivElement>(null);
  const instructionBlockRefs = useRef<HTMLDivElement>(null);
  const instructionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Set initial height after a delay to ensure content is rendered
    const timer = setTimeout(() => {
      if (codeContentRef.current) {
        const height = Math.round(codeContentRef.current.offsetHeight);
        setLHSheight(`${height}`);
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
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
            setLHSheight(`${Math.round(newHeight)}`);
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

    if (window.innerWidth < 1024 && instructionRefs.current[index]) {
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

  //height used for the instructions container when the screen is < 1024px. Maintains 1:2 ratio of instruction to code
  const smAndMbHeight = LHSheight ? `${Number(LHSheight) / 2}px` : null;

  const calculateInstructionsHeight = () => {
    return instructionRefs.current.reduce((total, ref) => {
      return total + (ref?.offsetHeight || 0);
    }, 0);
  };

  const checkIfScrollable = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      return (
        calculateInstructionsHeight() >=
        Number.parseInt(smAndMbHeight || "0", 10)
      );
    }
    return (
      calculateInstructionsHeight() > Number.parseInt(LHSheight || "0", 10)
    );
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

      <div className="content-wrapper flex flex-col lg:flex-row rounded-2xl">
        <div
          className="instructions relative flex shrink-0 flex-col rounded-t-2xl bg-gray-800 lg:w-1/3 lg:rounded-r-none lg:rounded-bl-2xl border border-neutral-border-subtle rounded-br-none"
          ref={instructionBlockRefs}
          style={{
            height:
              typeof window !== "undefined" &&
              window.innerWidth > MD_BREAKPOINT &&
              LHSheight &&
              LHSheight > MIN_INSTRUCTIONS_HEIGHT
                ? `${Number(LHSheight) + 2}px`
                : "auto",
          }}
        >
          <div
            className={`${
              isBottomOfInstructions ||
              instruction?.length === 0 ||
              !instruction ||
              !checkIfScrollable()
                ? "hidden"
                : ""
            } absolute bottom-0 left-0 right-0 z-10`}
          >
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black to-transparent opacity-60 lg:rounded-bl-2xl" />
            <ChevronDownIcon
              onClick={handleDownArrowClick}
              className="absolute bottom-4 left-1/2 size-7 -translate-x-1/2 cursor-pointer text-xl text-white shadow-md"
            />
          </div>

          <div
            className="overflow-auto rounded-t-2xl lg:rounded-bl-2xl rounded-bl-none lg:rounded-tr-none flex-1"
            onScroll={checkIfBottom}
          >
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
                    className={`instruction-item cursor-pointer bg-gray-800 p-4 text-white border border-neutral-border-subtle border-x-0 first:border-t-0 last:border-b-0 last:rounded-bl-none
                  ${clickedInstruction === idx ? "bg-slate-600" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInstructionClick(
                        idx,
                        inst.codeLineStart,
                        inst.codeLineEnd
                      );
                    }}
                  >
                    <h5 className="font-tuner">{`${idx + 1}. ${
                      inst.header || "Default Header"
                    }`}</h5>
                    <div
                      className={`overflow-auto transition-all ease-in-out ${
                        clickedInstruction === idx
                          ? "max-h-full opacity-100 duration-500"
                          : "max-h-0 opacity-0 duration-0"
                      }`}
                    >
                      <p className="mt-2 text-sm text-gray-300 leading-relaxed">
                        {inst.itemDescription || "Default Item Description"}
                      </p>
                    </div>
                  </div>
                )) || (
                  <p className="p-4 text-white py-4">
                    No instructions available.
                  </p>
                ))}
            </div>
          </div>
        </div>

        <div
          ref={codeblockRef}
          className="flex flex-col top-3 z-10 h-fit lg:w-[66%] rounded-b-2xl lg:rounded-r-2xl py-0 bg-neutral-background shadow-sm border border-neutral-border-subtle lg:border-l-0 lg:rounded-bl-none"
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
                    value={code}
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
