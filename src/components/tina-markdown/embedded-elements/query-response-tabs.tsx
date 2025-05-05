import { useState, useRef, useEffect } from "react";

import React from "react";

import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/plugins/line-numbers/prism-line-numbers";
import "prismjs/plugins/line-numbers/prism-line-numbers.css";
import "prismjs/plugins/line-highlight/prism-line-highlight";
import "prismjs/plugins/line-highlight/prism-line-highlight.css";
//Custom theming
import "./code-block.helper.css";

import {
  CheckIcon as CheckIconOutline,
  ClipboardIcon as ClipboardIconOutline,
} from "@heroicons/react/24/outline";

export const QueryResponseTabs = ({ ...props }) => {
  const [isQuery, setIsQuery] = useState(!props.preselectResponse);
  const [height, setHeight] = useState(0);
  const [hasCopied, setHasCopied] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  console.log(props);

  useEffect(() => {
    const updateHeight = () => {
      if (contentRef.current) {
        setHeight(contentRef.current.scrollHeight);
      }
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [isQuery]);

  // Highlight code when query/response changes
  useEffect(() => {
    if (document) {
      Prism.highlightAll();
    }
  }, [props.query, props.response, isQuery]);

  // Handle the copy action
  const handleCopy = () => {
    const textToCopy = isQuery ? props.query : props.response;
    navigator.clipboard.writeText(textToCopy || "");
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const buttonStyling =
    "flex justify-center cursor-pointer relative leading-tight text-white py-[8px] text-base font-bold transition duration-150 ease-out rounded-t-3xl flex items-center gap-1 whitespace-nowrap px-6";
  const activeButtonStyling =
    " hover:-translate-y-px active:translate-y-px hover:-translate-x-px active:translate-x-px hover:text-gray-50 opacity-50 hover:opacity-100";
  const underlineStyling =
    "transition-[width] absolute h-0.25 -bottom-0.25 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg";

  return (
    <div className="mb-1">
      <style>{`
        .query-response-pre pre,
        .query-response-pre code {
          white-space: pre !important;
          tab-size: 2;
        }
      `}</style>
      <div className="flex flex-col top-3 z-10 w-full rounded-xl py-0 pt-1 bg-slate-900">
        {/* TOP SECTION w/ Buttons */}
        <div className="flex items-center border-b border-b-white/30 w-full">
          <div className="flex flex-1">
            <button
              type="button"
              onClick={() => setIsQuery(true)}
              className={buttonStyling + (isQuery ? "" : activeButtonStyling)}
              disabled={isQuery}
            >
              {props.customQueryName || "Query"}
              <div
                className={underlineStyling + (isQuery ? " w-full" : " w-0")}
              />
            </button>
            <button
              type="button"
              onClick={() => setIsQuery(false)}
              className={buttonStyling + (isQuery ? activeButtonStyling : "")}
              disabled={!isQuery}
            >
              {props.customResponseName || "Response"}
              <div
                className={underlineStyling + (isQuery ? " w-0" : " w-full")}
              />
            </button>
          </div>

          {/* Copy Button */}
          <div className="flex pr-4">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-sm font-medium text-white/70 hover:text-white transition-colors duration-200 px-2 py-1 rounded hover:bg-white/10 cursor-pointer"
              title={`Copy ${isQuery ? "query" : "response"} code`}
            >
              {hasCopied ? (
                <>
                  <CheckIconOutline className="h-4 w-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <ClipboardIconOutline className="h-4 w-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* BOTTOM SECTION w/ Query/Response */}
        <div
          className="overflow-hidden transition-all duration-300 ease-in-out bg-[#1F2937] rounded-b-xl"
          style={{ height: `${height}px` }}
        >
          <div
            ref={contentRef}
            className="font-light font-mono text-xs text-[#D5DEEB] relative query-response-pre"
            style={{
              fontFamily:
                'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              fontWeight: 300,
              whiteSpace: "pre",
            }}
          >
            {isQuery ? (
              <div className="p-2 relative">
                <pre
                  className="language-javascript line-numbers"
                  style={{ position: "relative", whiteSpace: "pre" }}
                >
                  <code className="language-javascript">{props.query}</code>
                </pre>
              </div>
            ) : (
              <div className="p-2 relative">
                <pre
                  className="language-javascript line-numbers"
                  style={{ position: "relative", whiteSpace: "pre" }}
                >
                  <code className="language-javascript">{props.response}</code>
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
