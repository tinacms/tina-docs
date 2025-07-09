import {
  transformerNotationDiff,
  transformerNotationFocus,
  transformerNotationHighlight,
} from "@shikijs/transformers";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { MdContentCopy } from "react-icons/md";
import { createHighlighter } from "shiki";
import "../standard-elements/code-block/code-block.css";
import { CodeBlockSkeleton } from "../standard-elements/code-block/code-block-skeleton";

const CodeTab = ({
  lang,
  onCopy,
  tooltipVisible,
}: {
  lang?: string;
  onCopy: () => void;
  tooltipVisible: boolean;
}) => (
  <div className="flex items-center justify-between w-full border-b border-neutral-border-subtle h-full">
    <span className="justify-center relative leading-tight text-neutral-text py-[8px] text-base transition duration-150 ease-out rounded-t-3xl flex items-center gap-1 whitespace-nowrap px-6 font-medium">
      {lang || "Unknown"}
    </span>
    <div className="relative ml-4 flex items-center space-x-4 overflow-visible pr-2">
      <button
        type="button"
        onClick={onCopy}
        className={`flex items-center text-sm font-medium text-neutral-text-secondary transition-colors duration-200 px-2 py-1 rounded hover:bg-white/10 cursor-pointer ${
          tooltipVisible ? "ml-1 rounded-md" : ""
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
  lang = "javascript",
  children,
  highlightLines,
}: CodeBlockProps) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [html, setHtml] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  const codeToHighlight = typeof children === "string" ? children : value || "";

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);

      if (!codeToHighlight || typeof codeToHighlight !== "string") {
        if (isMounted) {
          setHtml("");
          setIsLoading(false);
        }
        return;
      }

      try {
        const highlighter = await createHighlighter({
          themes: ["night-owl", "github-light"],
          langs: [lang],
        });

        if (highlighter) {
          // Add focus notation to the code based on highlightLines
          let codeWithFocus = codeToHighlight;
          if (highlightLines) {
            const lines = codeToHighlight.split("\n");
            const highlightRanges = highlightLines
              .split(",")
              .map((range) => range.trim())
              .filter((range) => range);

            for (const range of highlightRanges) {
              if (range.includes("-")) {
                const [start, end] = range.split("-").map(Number);
                for (let i = start - 1; i < end && i < lines.length; i++) {
                  if (lines[i] && !lines[i].includes("// [!code focus]")) {
                    lines[i] = `${lines[i]} // [!code focus]`;
                  }
                }
              } else {
                const lineNum = Number.parseInt(range, 10) - 1;
                if (
                  lineNum >= 0 &&
                  lineNum < lines.length &&
                  lines[lineNum] &&
                  !lines[lineNum].includes("// [!code focus]")
                ) {
                  lines[lineNum] = `${lines[lineNum]} // [!code focus]`;
                }
              }
            }
            codeWithFocus = lines.join("\n");
          }

          const code = await highlighter.codeToHtml(codeWithFocus, {
            lang,
            theme: isDarkMode ? "night-owl" : "github-light",
            transformers: [
              transformerNotationDiff({ matchAlgorithm: "v3" }),
              transformerNotationHighlight({ matchAlgorithm: "v3" }),
              transformerNotationFocus({ matchAlgorithm: "v3" }),
            ],
            meta: {
              showLineNumbers: true,
            },
          });

          if (isMounted) {
            setHtml(code);
            setIsLoading(false);
          }
        }
      } catch (error) {
        if (isMounted) {
          setHtml(`<pre><code>${codeToHighlight}</code></pre>`);
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [codeToHighlight, lang, isDarkMode, highlightLines]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(codeToHighlight).then(
      () => {
        setTooltipVisible(true);
        setTimeout(() => setTooltipVisible(false), 1500);
      },
      (err) => {}
    );
  };

  const shikiClassName = `shiki ${isDarkMode ? "night-owl" : "github-light"} ${
    highlightLines ? "has-focused" : ""
  }`;

  return (
    <div className="codeblock-container h-full flex flex-col">
      <div className="sticky top-0 z-30">
        <CodeTab
          lang={lang}
          onCopy={copyToClipboard}
          tooltipVisible={tooltipVisible}
        />
      </div>
      <div
        className={`${shikiClassName} w-full flex-1 overflow-x-auto bg-background-brand-code py-5 px-2 text-sm border border-neutral-border-subtle/50 shadow-sm rounded-b-lg`}
        style={{
          overflowX: "hidden",
          maxWidth: "100%",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki output is trusted and already escaped for XSS safety.
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
};

export default CodeBlockWithHighlightLines;
