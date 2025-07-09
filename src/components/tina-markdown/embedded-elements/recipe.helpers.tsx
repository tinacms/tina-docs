import Prism from "prismjs";
import type React from "react";
import { useEffect, useRef, useState } from "react";

import "prismjs/plugins/line-highlight/prism-line-highlight";
import "prismjs/plugins/line-highlight/prism-line-highlight.css";
import "prismjs/plugins/line-numbers/prism-line-numbers";
import "prismjs/plugins/line-numbers/prism-line-numbers.css";
import { MdContentCopy } from "react-icons/md";

const CodeToolbar = ({
  lang,
  onCopy,
  tooltipVisible,
}: {
  lang?: string;
  onCopy: () => void;
  tooltipVisible: boolean;
}) => (
  <div className="flex items-center justify-between w-full border-b border-neutral-border-subtle ">
    <span className="justify-center relative leading-tight text-neutral-text py-[8px] text-base transition duration-150 ease-out rounded-t-3xl flex items-center gap-1 whitespace-nowrap px-6 font-medium">
      {lang || "Unknown"}
    </span>
    <div className="relative ml-4 flex items-center space-x-4 overflow-visible pr-2">
      <button
        type="button"
        onClick={onCopy}
        className={`flex items-center text-sm font-medium text-neutral-text-secondary transition-colors duration-200 px-2 py-1 rounded hover:bg-white/10 cursor-pointer ${
          tooltipVisible ? "ml-1 rounded-md bg-gray-700 text-white" : ""
        }`}
      >
        {!tooltipVisible && <MdContentCopy className="size-4" />}
        <span>{!tooltipVisible ? "" : "Copied!"}</span>
      </button>
    </div>
  </div>
);

interface CodeBlockProps {
  value?: string;
  lang?: string;
  children?: React.ReactNode;
  highlightLines: string;
}

const CodeBlockWithHighlightLines = ({
  value,
  lang = "Javascript",
  children,
  highlightLines,
}: CodeBlockProps) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (preRef.current) {
      preRef.current.setAttribute("data-line", highlightLines);
      Prism.highlightAllUnder(preRef.current);
    }
  }, [highlightLines]);

  const copyToClipboard = () => {
    const codeToCopy = typeof children === "string" ? children : value || "";
    navigator.clipboard.writeText(codeToCopy).then(
      () => {
        setTooltipVisible(true);
        setTimeout(() => setTooltipVisible(false), 1500);
      },
      (err) => {}
    );
  };

  return (
    <div className="codeblock-container">
      <div className="sticky top-0 z-30">
        <CodeToolbar
          lang={lang}
          onCopy={copyToClipboard}
          tooltipVisible={tooltipVisible}
        />
      </div>
      <pre
        ref={preRef}
        className="line-numbers"
        data-line={highlightLines}
        style={{
          overflowX: "hidden",
          maxWidth: "100%",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        <code className={`language-${lang}`}>{value || children}</code>
      </pre>
    </div>
  );
};

export default CodeBlockWithHighlightLines;
