import Prism from "prismjs";
import type React from "react";
import { useEffect, useRef, useState } from "react";

import "prismjs/plugins/line-highlight/prism-line-highlight";
import "prismjs/plugins/line-highlight/prism-line-highlight.css";
import "prismjs/plugins/line-numbers/prism-line-numbers";
import "prismjs/plugins/line-numbers/prism-line-numbers.css";
import { MdOutlineContentCopy } from "react-icons/md";

const CodeToolbar = ({
  lang,
  onCopy,
  tooltipVisible,
}: {
  lang?: string;
  onCopy: () => void;
  tooltipVisible: boolean;
}) => (
  <div className="code-toolbar flex items-center justify-between bg-gray-800 px-4 py-2 text-sm font-semibold text-white lg:rounded-t-xl">
    <span className="font-tuner">{lang || "Unknown"}</span>
    <div className="relative ml-4 flex items-center space-x-4 overflow-visible">
      <button
        onClick={onCopy}
        className={`relative flex items-center space-x-1 rounded-md  bg-gray-800 px-2 py-1 text-sm transition-colors duration-200 ${
          tooltipVisible
            ? "ml-1 rounded-md bg-gray-700 text-white"
            : "text-white hover:bg-gray-700"
        }`}
      >
        {!tooltipVisible && <MdOutlineContentCopy className="size-4" />}
        <span>{!tooltipVisible ? "Copy" : "Copied!"}</span>
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
  lang = "javascript",
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
        {/* eslint-disable-next-line tailwindcss/no-custom-classname */}
        <code className={`language-${lang}`}>{value || children}</code>
      </pre>
    </div>
  );
};

export default CodeBlockWithHighlightLines;
