"use client";

import { CheckIcon, ClipboardIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";
import Prism from "prismjs";
import "prismjs/plugins/line-numbers/prism-line-numbers";
import "prismjs/plugins/line-numbers/prism-line-numbers.css";

// Initialize Prism with line numbers - i dont like it either :(
Prism.hooks.add("complete", function (env) {
  if (!env.code) return;
  const lines = env.code.split("\n");
  const lineNumbersWrapper = document.createElement("span");
  lineNumbersWrapper.className = "line-numbers-rows";
  lineNumbersWrapper.setAttribute("aria-hidden", "true");
  for (let i = 0; i < lines.length; i++) {
    const lineNumber = document.createElement("span");
    lineNumber.setAttribute("data-line-number", String(i + 1));
    lineNumbersWrapper.appendChild(lineNumber);
  }
  env.element.appendChild(lineNumbersWrapper);
});

export const CodeBlock = ({
  children,
  value,
  lang,
  showLineNumbers = false,
}: {
  children?: string;
  value?: string;
  lang?: string;
  showLineNumbers?: boolean;
}) => {
  const [hasCopied, setHasCopied] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    Prism.highlightAll();
  }, []);

  useEffect(() => {
    if (isMounted) {
      Prism.highlightAll();
    }
  }, [children, value, isMounted]);

  const handleCopy = () => {
    navigator.clipboard.writeText(children || value || "");
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  if (!isMounted) {
    return (
      <div className="word-break white-space margin-0 relative overflow-x-hidden !rounded-xl pb-3">
        <pre>
          <code className={`language-${lang || "jsx"}`}>
            {children || value || ""}
          </code>
        </pre>
      </div>
    );
  }

  return (
    <div className="word-break white-space margin-0 relative overflow-x-hidden !rounded-xl pb-3">
      <button
        type="button"
        onClick={handleCopy}
        className="absolute right-3 top-0 z-10 flex size-6 items-center justify-center rounded text-zinc-50 hover:bg-zinc-700 hover:text-zinc-50"
      >
        {hasCopied ? (
          <CheckIcon className="size-4" />
        ) : (
          <ClipboardIcon className="size-4" />
        )}
        <span className="sr-only">Copy</span>
      </button>
      <pre className={showLineNumbers ? "line-numbers" : ""}>
        <code className={`language-${lang || "jsx"}`}>
          {children || value || ""}
        </code>
      </pre>
    </div>
  );
};

export default CodeBlock;
