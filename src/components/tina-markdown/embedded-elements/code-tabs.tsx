import { CheckIcon as CheckIconOutline } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import React from "react";
import { MdContentCopy } from "react-icons/md";
import { CodeBlock } from "../standard-elements/code-block/code-block";
import { CodeBlockSkeleton } from "../standard-elements/code-block/code-block-skeleton";

interface Tab {
  name: string;
  content: string;
  id?: string;
  language?: string;
}

interface CodeTabsProps {
  tabs: Tab[];
  initialSelectedIndex?: number;
}

export const CodeTabs = ({ tabs, initialSelectedIndex = 0 }: CodeTabsProps) => {
  const [selectedTabIndex, setSelectedTabIndex] = useState(
    initialSelectedIndex > tabs.length ? 0 : initialSelectedIndex
  );
  const [height, setHeight] = useState(0);
  const [hasCopied, setHasCopied] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Initialize tab refs array
  useEffect(() => {
    tabRefs.current = tabRefs.current.slice(0, tabs.length);
  }, [tabs.length]);

  useEffect(() => {
    const updateHeight = () => {
      const activeRef = tabRefs.current[selectedTabIndex];
      if (activeRef) {
        setHeight(activeRef.scrollHeight);
      }
    };
    updateHeight();
    const resizeObserver = new ResizeObserver(updateHeight);
    const activeRef = tabRefs.current[selectedTabIndex];
    if (activeRef) {
      resizeObserver.observe(activeRef);
    }
    return () => {
      resizeObserver.disconnect();
    };
  }, [selectedTabIndex]);

  // Handle tab switching with transition
  const handleTabSwitch = (newTabIndex: number) => {
    if (newTabIndex !== selectedTabIndex) {
      setSelectedTabIndex(newTabIndex);
    }
  };

  // Handle the copy action
  const handleCopy = () => {
    const textToCopy = tabs[selectedTabIndex]?.content;
    navigator.clipboard.writeText(textToCopy || "");
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const buttonStyling =
    "flex justify-center relative leading-tight text-neutral-text py-[8px] text-base font-bold transition duration-150 ease-out rounded-t-3xl flex items-center gap-1 whitespace-nowrap px-6";
  const activeButtonStyling =
    " hover:text-neutral-text-secondary opacity-50 hover:opacity-100";
  const underlineStyling =
    "transition-[width] absolute h-0.5 -bottom-0.25 bg-brand-primary rounded-lg";

  // Early return if no tabs provided
  if (!tabs || tabs.length === 0) {
    return null;
  }

  return (
    <div className="my-8">
      <style>{`
        .query-response-pre pre,
        .query-response-pre code {
          white-space: pre !important;
          tab-size: 2;
        }
      `}</style>
      <div className="flex flex-col z-10 w-full rounded-xl py-0 bg-neutral-background shadow-lg border border-neutral-border">
        {/* TOP SECTION w/ Buttons */}
        <div className="flex items-center w-full border-b border-neutral-border ">
          <div className="flex flex-1 ">
            {tabs?.map((tab, index) => (
              <button
                key={tab.id || index}
                type="button"
                onClick={() => handleTabSwitch(index)}
                className={`${buttonStyling}${
                  selectedTabIndex === index ? "" : activeButtonStyling
                }${isTransitioning ? " cursor-not-allowed" : " cursor-pointer"}`}
                disabled={selectedTabIndex === index || isTransitioning}
              >
                {tab.name}
                <div
                  className={
                    underlineStyling +
                    (selectedTabIndex === index ? " w-full" : " w-0")
                  }
                />
              </button>
            ))}
          </div>

          {/* Copy Button */}
          <div className="flex pr-2">
            <button
              type="button"
              onClick={handleCopy}
              disabled={isTransitioning}
              className={`flex items-center gap-1.5 text-sm font-medium text-neutral-text-secondary transition-colors duration-200 px-2 py-1 rounded hover:bg-white/10 ${
                isTransitioning
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
              title={`Copy ${tabs[selectedTabIndex]?.name.toLowerCase()} code`}
            >
              {hasCopied ? (
                <>
                  <CheckIconOutline className="h-4 w-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <MdContentCopy className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* BOTTOM SECTION w/ Tab Content */}
        {isTransitioning && <CodeBlockSkeleton hasTabs={true} />}
        <div
          className="overflow-hidden rounded-b-xl"
          hidden={isTransitioning}
          style={{ height: `${height}px` }}
        >
          <div
            ref={contentRef}
            className="font-light font-mono text-xs text-neutral-text hover:text-neutral-text-secondary relative query-response-pre"
            style={{
              fontFamily:
                'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              fontWeight: 300,
              whiteSpace: "pre",
            }}
          >
            {tabs.map((tab, index) => (
              <div
                key={tab.id || index}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                className="relative -mt-2"
                style={{
                  display: selectedTabIndex === index ? "block" : "none",
                }}
              >
                <CodeBlock
                  value={tab.content?.replaceAll("�", " ")}
                  lang={tab.language ?? "text"}
                  showCopyButton={false}
                  showBorder={false}
                  setIsTransitioning={setIsTransitioning}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
