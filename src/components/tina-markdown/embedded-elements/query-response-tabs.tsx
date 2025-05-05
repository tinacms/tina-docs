import { useState, useRef, useEffect } from "react";
import { Components, TinaMarkdown } from "tinacms/dist/rich-text";
import { MarkdownComponentMapping } from "../markdown-component-mapping";
import React from "react";
import { ClipboardIcon } from "@heroicons/react/24/outline";
import { CheckIcon } from "@heroicons/react/24/outline";
import Prism from "prismjs";
import "prismjs/plugins/line-numbers/prism-line-numbers";
import "prismjs/plugins/line-numbers/prism-line-numbers.css";
import CodeBlock from "../standard-elements/code-block";

export const QueryResponseTabs = ({ ...props }) => {
  const [isQuery, setIsQuery] = useState(!props.preselectResponse);
  const [height, setHeight] = useState(0);
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

  const buttonStyling =
    "flex justify-center cursor-pointer relative leading-tight text-white py-[8px] text-base font-bold transition duration-150 ease-out rounded-t-3xl flex items-center gap-1 whitespace-nowrap px-6";
  const activeButtonStyling =
    " hover:-translate-y-px active:translate-y-px hover:-translate-x-px active:translate-x-px hover:text-gray-50 opacity-50 hover:opacity-100";
  const overlay = (
    <div
      className="w-full grow rounded-md"
      style={{
        backgroundColor: "rgb(31,41,55)",
      }}
    />
  );
  const underlineStyling =
    "transition-[width] absolute h-0.25 -bottom-0.25 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg";

  return (
    <div className="mb-1">
      <div className="flex flex-col top-3 z-10 w-full rounded-xl py-0 pt-1 bg-slate-900">
        {/* TOP SECTION w/ Buttons */}
        <div className="flex items-center border-b border-b-white/30 w-full">
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
        {/* BOTTOM SECTION w/ Query/Response */}
        <div
          className="overflow-hidden transition-all duration-300 ease-in-out bg-[#1F2937] rounded-b-xl"
          style={{ height: `${height}px` }}
        >
          <div
            ref={contentRef}
            className="font-light font-mono text-xs text-[#D5DEEB]"
            style={{
              fontFamily:
                'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              fontWeight: 300,
            }}
          >
            {isQuery ? (
              <div>
                <TinaMarkdown
                  content={props.query}
                  components={QueryResponseTabsMarkdownRenderer}
                />
              </div>
            ) : (
              <div>
                <TinaMarkdown
                  content={props.response}
                  components={QueryResponseTabsMarkdownRenderer}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const QueryResponseTabsMarkdownRenderer: Components<{
  code_block: {
    value: string;
    lang?: string;
    showLineNumbers?: boolean;
  };
}> = {
  code_block: (props) => {
    if (!props?.value) {
      return null;
    }
    return (
      <div className="pt-2">
        <CodeBlock
          value={props.value}
          lang={props.lang || "text"}
          children={props.value}
        />
      </div>
    );
  },
};
