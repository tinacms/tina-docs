import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { MdContentCopy } from "react-icons/md";
import { shikiSingleton } from "../standard-elements/code-block/shiki-singleton";
import "../standard-elements/code-block/code-block.css";

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
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  // Use a default theme for server-side rendering to prevent hydration mismatch
  const isDarkMode = mounted ? resolvedTheme === "dark" : false;

  const codeToHighlight = typeof children === "string" ? children : value || "";

  useEffect(() => {
    setMounted(true);
  }, []);

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
        // Add focus notation to the code based on highlightLines
        let codeWithFocus = codeToHighlight;
        if (highlightLines) {
          const lines = codeToHighlight.split("\n");
          const highlightRanges = highlightLines
            .split(",")
            .map((range) => range.trim())
            .filter((range) => range);

          // Process ranges in reverse order to avoid index shifting when inserting
          const sortedRanges = highlightRanges
            .map((range) => {
              if (range.includes("-")) {
                const [start, end] = range.split("-").map(Number);
                return { start: start - 1, count: end - start + 1 };
              }
              const lineNum = Number.parseInt(range, 10) - 1;
              return { start: lineNum, count: 1 };
            })
            .filter((r) => r.start >= 0 && r.start < lines.length)
            .sort((a, b) => b.start - a.start); // Sort in reverse order

          for (const { start, count } of sortedRanges) {
            // Insert the focus notation comment before the target line
            lines.splice(start, 0, `// [!code focus:${count}]`);
          }

          codeWithFocus = lines.join("\n");
        }

        const code = await shikiSingleton.codeToHtml(
          codeWithFocus,
          lang,
          isDarkMode
        );

        if (isMounted) {
          setHtml(code);
          setIsLoading(false);
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
        className={`${shikiClassName} w-full flex-1 overflow-x-auto bg-background-brand-code py-5 px-2 text-sm border border-neutral-border-subtle/50 shadow-sm rounded-b-xl lg:rounded-bl-none md:rounded-br-xl`}
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
