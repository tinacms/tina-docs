import { CheckIcon as CheckIconOutline } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import React from "react";
import { MdContentCopy } from "react-icons/md";
import { CodeBlock } from "../standard-elements/code-block/code-block";
import { CodeBlockSkeleton } from "../standard-elements/code-block/code-block-skeleton";

export const QueryResponseTabs = ({ ...props }) => {
  const [isQuery, setIsQuery] = useState(!props.preselectResponse);
  const [height, setHeight] = useState(0);
  const [hasCopied, setHasCopied] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const queryRef = useRef<HTMLDivElement>(null);
  const responseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateHeight = () => {
      const activeRef = isQuery ? queryRef : responseRef;
      if (activeRef.current) {
        setHeight(activeRef.current.scrollHeight);
      }
    };
    updateHeight();
    const resizeObserver = new ResizeObserver(updateHeight);
    const activeRef = isQuery ? queryRef : responseRef;
    if (activeRef.current) {
      resizeObserver.observe(activeRef.current);
    }
    setIsTransitioning(false);
    return () => {
      resizeObserver.disconnect();
      setIsTransitioning(true);
    };
  }, [isQuery]);

  // Handle tab switching with transition
  const handleTabSwitch = (newIsQuery: boolean) => {
    if (newIsQuery !== isQuery) {
      setIsTransitioning(true);
      setIsQuery(newIsQuery);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  // Handle the copy action
  const handleCopy = () => {
    const textToCopy = isQuery ? props.query : props.response;
    navigator.clipboard.writeText(textToCopy || "");
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const buttonStyling =
    "flex justify-center cursor-pointer relative leading-tight text-neutral-text py-[8px] text-base font-bold transition duration-150 ease-out rounded-t-3xl flex items-center gap-1 whitespace-nowrap px-6";
  const activeButtonStyling =
    " hover:text-neutral-text-secondary opacity-50 hover:opacity-100";
  const underlineStyling =
    "transition-[width] absolute h-0.5 -bottom-0.25 bg-brand-primary rounded-lg";

  return (
    <div className="mb-1">
      <style>{`
        .query-response-pre pre,
        .query-response-pre code {
          white-space: pre !important;
          tab-size: 2;
        }
      `}</style>
      <div className="flex flex-col top-3 z-10 w-full rounded-xl py-0 bg-neutral-background shadow-sm border border-neutral-border-subtle">
        {/* TOP SECTION w/ Buttons */}
        <div className="flex items-center w-full border-b border-neutral-border-subtle ">
          <div className="flex flex-1 ">
            <button
              type="button"
              onClick={() => handleTabSwitch(true)}
              className={buttonStyling + (isQuery ? "" : activeButtonStyling)}
              disabled={isQuery || isTransitioning}
            >
              {props.customQueryName || "Query"}
              <div
                className={underlineStyling + (isQuery ? " w-full" : " w-0")}
              />
            </button>
            <button
              type="button"
              onClick={() => handleTabSwitch(false)}
              className={buttonStyling + (isQuery ? activeButtonStyling : "")}
              disabled={!isQuery || isTransitioning}
            >
              {props.customResponseName || "Response"}
              <div
                className={underlineStyling + (isQuery ? " w-0" : " w-full")}
              />
            </button>
          </div>

          {/* Copy Button */}
          <div className="flex pr-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-sm font-medium text-neutral-text-secondary transition-colors duration-200 px-2 py-1 rounded hover:bg-white/10 cursor-pointer"
              title={`Copy ${isQuery ? "query" : "response"} code`}
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
        {/* BOTTOM SECTION w/ Query/Response */}
        {isTransitioning && <CodeBlockSkeleton isCodeBlockTab={true} />}
        <div
          className="overflow-hidden transition-all duration-300 ease-in-out rounded-b-xl"
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
            {isQuery ? (
              <div ref={queryRef} className="relative -mt-2">
                <CodeBlock
                  value={props.query}
                  lang="javascript"
                  showCopyButton={false}
                  showBorder={false}
                />
              </div>
            ) : (
              <div ref={responseRef} className="-mt-2 relative">
                <CodeBlock
                  value={props.response}
                  lang="javascript"
                  showCopyButton={false}
                  showBorder={false}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
