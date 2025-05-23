import { useEffect, useState } from "react";
import { createHighlighter } from "shiki";
import "./code-block.css";
import {
  transformerNotationDiff,
  transformerNotationFocus,
  transformerNotationHighlight,
} from "@shikijs/transformers";
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

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const highlighter = await createHighlighter({
        themes: ["night-owl"],
        langs: [lang],
      });

      const code = await highlighter.codeToHtml(value, {
        lang,
        theme: "night-owl",
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
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [value, lang]);

  return (
    <div className={`relative w-full my-2${showCopyButton ? " group" : ""}`}>
      <div
        className={`absolute top-0 right-0 z-10 px-2 py-1 text-xs font-mono text-[#d6deeb] transition-opacity duration-200 opacity-100 group-hover:opacity-0 group-hover:pointer-events-none ${
          showCopyButton ? "" : "hidden"
        }`}
      >
        {lang}
      </div>
      <div
        className={`absolute top-0 right-0 z-10 mx-2 my-1 text-xs font-mono bg-[#222] transition-opacity duration-200 opacity-0 group-hover:opacity-100 cursor-pointer ${
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
          className="px-2 py-1 text-[#d6deeb] rounded transition cursor-pointer flex items-center gap-1"
        >
          {isCopied ? <FaCheck size={12} /> : <MdOutlineContentCopy />}
        </button>
      </div>

      <div
        className="shiki w-full overflow-x-auto rounded-lg bg-[#011627] p-4 text-sm"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki output is trusted and already escaped for XSS safety.
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
