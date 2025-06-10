import { useEffect, useState } from "react";
import { createHighlighter } from "shiki";
import "./code-block.css";
import {
  transformerNotationDiff,
  transformerNotationFocus,
  transformerNotationHighlight,
} from "@shikijs/transformers";
import { useTheme } from "next-themes";
import { FaCheck } from "react-icons/fa";
import { MdOutlineContentCopy } from "react-icons/md";

export function CodeBlock({
  value,
  lang = "ts",
  showCopyButton = true,
}: {
  value: string;
  lang?: string;
  showCopyButton?: boolean;
}) {
  const [html, setHtml] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      // Guard clause to prevent processing undefined/null/empty values - shiki will throw an error if the value is not a string as it tries to .split all values
      if (!value || typeof value !== "string") {
        if (isMounted) setHtml("");
        return;
      }

      const highlighter = await createHighlighter({
        themes: ["night-owl", "github-light"],
        langs: [lang],
      });

      if (highlighter) {
        const code = await highlighter?.codeToHtml(value, {
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

        if (isMounted) setHtml(code);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [value, lang, isDarkMode]);

  return (
    <div className={`relative w-full my-2 ${showCopyButton ? " group" : ""}`}>
      <div
        className={`absolute top-0 right-0 z-10 px-4 py-1 text-xs font-mono text-neutral-text-secondary transition-opacity duration-200 opacity-100 group-hover:opacity-0 group-hover:pointer-events-none ${
          showCopyButton ? "" : "hidden"
        }`}
      >
        {lang}
      </div>
      <div
        className={`absolute top-0 right-0 z-10 mx-2 my-1 text-xs font-mono transition-opacity duration-200 opacity-0 group-hover:opacity-100 cursor-pointer ${
          showCopyButton ? "" : "hidden"
        }`}
      >
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(value);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 1000);
          }}
          className="px-2 py-1 text-neutral-text-secondary rounded transition cursor-pointer flex items-center gap-1"
        >
          {isCopied ? <FaCheck size={12} /> : <MdOutlineContentCopy />}
        </button>
      </div>

      <div
        className={`shiki w-full overflow-x-auto bg-background-brand-code py-4 px-2 text-sm border border-neutral-border-subtle shadow-sm ${
          showCopyButton ? "rounded-lg" : "rounded-b-xl"
        }`}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki output is trusted and already escaped for XSS safety.
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
