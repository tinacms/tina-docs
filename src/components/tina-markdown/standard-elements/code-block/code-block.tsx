import { useEffect, useState } from "react";
import "./code-block.css";
import { useTheme } from "next-themes";
import { FaCheck } from "react-icons/fa";
import { MdOutlineContentCopy } from "react-icons/md";
import { CodeBlockSkeleton } from "./code-block-skeleton";
import { shikiSingleton } from "./shiki-singleton";

export function CodeBlock({
  value,
  lang = "ts",
  showCopyButton = true,
  showBorder = true,
  setIsTransitioning,
}: {
  value: string;
  lang?: string;
  showCopyButton?: boolean;
  showBorder?: boolean;
  setIsTransitioning?: (isTransitioning: boolean) => void;
}) {
  const [html, setHtml] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);

      // Guard clause to prevent processing undefined/null/empty values - shiki will throw an error if the value is not a string as it tries to .split all values
      if (!value || typeof value !== "string") {
        if (isMounted) {
          setHtml("");
          setIsLoading(false);
        }
        return;
      }

      try {
        const code = await shikiSingleton.codeToHtml(value, lang, isDarkMode);

        if (isMounted) {
          setHtml(code);
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          // Fallback to plain text if highlighting fails
          setHtml(`<pre><code>${value}</code></pre>`);
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [value, lang, isDarkMode]);

  useEffect(() => {
    if (setIsTransitioning && html !== "") {
      // Increase timeout to 200ms for smoother transitions, especially on slower devices.
      setTimeout(() => setIsTransitioning(false), 200);
    }
  }, [html, setIsTransitioning]);

  // Show skeleton while loading
  if (isLoading && showCopyButton) {
    return <CodeBlockSkeleton />;
  }

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
        className={`shiki w-full overflow-x-auto bg-background-brand-code py-5 px-2 text-sm ${
          showBorder ? "border border-neutral-border-subtle/50 shadow-sm" : ""
        } ${showCopyButton ? "rounded-lg" : "rounded-b-xl"}`}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki output is trusted and already escaped for XSS safety.
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
