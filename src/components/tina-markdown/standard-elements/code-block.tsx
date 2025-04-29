import { Prism } from "@/src/components/styles/prism";
import { CheckIcon, ClipboardIcon } from "@heroicons/react/24/outline";
import React from "react";

export const CodeBlock = ({ children, value, lang }) => {
  const [hasCopied, setHasCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(children || value || "");
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="word-break white-space margin-0 relative overflow-x-hidden !rounded-xl pb-3">
      <button
        type="button"
        onClick={handleCopy}
        className="absolute right-3 top-2 z-10 flex size-6 items-center justify-center rounded text-zinc-50 hover:bg-zinc-700 hover:text-zinc-50"
      >
        {hasCopied ? (
          <CheckIcon className="size-4" />
        ) : (
          <ClipboardIcon className="size-4" />
        )}
        <span className="sr-only">Copy</span>
      </button>
      <Prism
        value={children || value || ""}
        lang={lang || "jsx"}
        theme="nightOwl"
      />
    </div>
  );
};

export default CodeBlock;
