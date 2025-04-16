import Prism from "prismjs";
import type React from "react";
import { useEffect, useRef, useState } from "react";

import "prismjs/plugins/line-numbers/prism-line-numbers";
import "prismjs/plugins/line-numbers/prism-line-numbers.css";
import "prismjs/plugins/line-highlight/prism-line-highlight";
import "prismjs/plugins/line-highlight/prism-line-highlight.css";

import { CodeToolbar } from "./RecipeCodeToolBar";

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
