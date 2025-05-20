"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import copy from "copy-to-clipboard";
import htmlToMd from "html-to-md";
import { ChevronDown, Copy, FileCode } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { FaCommentDots } from "react-icons/fa";
import { SiOpenai } from "react-icons/si";

interface CopyPageDropdownProps {
  title?: string;
}

export const CopyPageDropdown: React.FC<CopyPageDropdownProps> = ({
  title = "Documentation Page",
}) => {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [markdownUrl, setMarkdownUrl] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 4000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  const getCleanHtmlContent = (): HTMLElement | null => {
    const element = document.getElementById("doc-content");
    if (!element) {
      alert("Unable to locate content for export.");
      return null;
    }

    const clone = element.cloneNode(true) as HTMLElement;
    clone
      .querySelectorAll("[data-exclude-from-md]")
      .forEach((el) => el.remove());
    return clone;
  };

  const convertToMarkdown = (html: string): string => {
    const rawMd = htmlToMd(html);
    return rawMd.replace(/<button>Copy<\/button>\n?/g, "");
  };

  const handleCopyPage = () => {
    const htmlContent = getCleanHtmlContent()?.innerHTML || "";
    const markdown = convertToMarkdown(htmlContent);
    const referenceSection = `\n\n---\nAsk questions about this page:\n- [Open in ChatGPT](https://chat.openai.com/chat)\n- [Open in Claude](https://claude.ai/)`;
    const finalContent = `${title}\n\n${markdown}${referenceSection}`;

    copy(finalContent);
    setCopied(true);
  };

  const exportMarkdownAndOpen = async (): Promise<string | null> => {
    if (markdownUrl) return markdownUrl;

    const htmlContent = getCleanHtmlContent()?.innerHTML || "";
    const markdown = convertToMarkdown(htmlContent);
    const pathname = window.location.pathname.replace(/^\//, "") || "index";
    const filename = `${pathname}.md`;

    try {
      const res = await fetch("/api/export-md", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: markdown, filename }),
      });

      if (!res.ok) throw new Error("Export failed");

      const data = await res.json();
      const fullUrl = `${window.location.origin}${data.url}`;
      setMarkdownUrl(fullUrl);
      return fullUrl;
    } catch (err) {
      console.error(err);
      alert("Failed to export Markdown.");
      return null;
    }
  };

  const handleViewMarkdown = async () => {
    const url = await exportMarkdownAndOpen();
    if (url) window.open(url, "_blank");
  };

  const openInLLM = async (generateUrl: (url: string) => string) => {
    const url = await exportMarkdownAndOpen();
    if (url) window.open(generateUrl(url), "_blank", "noopener,noreferrer");
  };

  if (!hasMounted) return null;

  return (
    <div
      className="inline-flex ml-auto rounded-xl overflow-hidden border-gray-200 font-medium text-gray-300 mb-4 lg:mb-0"
      data-exclude-from-md
    >
      {/* Primary copy button */}
      <button
        onClick={handleCopyPage}
        className={`cursor-pointer flex items-center gap-1 rounded-l-xl px-3 py-1 border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-background-dark hover:bg-gray-50 dark:hover:bg-gray-200/5 border-r-0 ${
          copied ? "bg-green-100 text-green-800" : "text-gray-600"
        }`}
        type="button"
      >
        <Copy className="w-4 h-4" />
        <span>{copied ? "Copied!" : "Copy page"}</span>
      </button>

      {/* Dropdown */}
      <DropdownMenu onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className="cursor-pointer px-3 border border-gray-200 bg-white rounded-r-xl hover:bg-gray-50 dark:hover:bg-gray-200/5 outline-none"
            type="button"
          >
            <ChevronDown
              className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
                isOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="z-50 mt-2 w-72 rounded-2xl p-1 shadow-xl bg-white">
          {[
            {
              icon: <Copy className="w-4 h-4 text-gray-600" />,
              label: "Copy page",
              description: "Copy page as Markdown for LLMs",
              onClick: handleCopyPage,
            },
            {
              icon: <FileCode className="w-4 h-4 text-gray-600" />,
              label: "View as Markdown",
              description: "View this page as plain text",
              onClick: handleViewMarkdown,
            },
            {
              icon: <SiOpenai className="w-4 h-4" />,
              label: "Open in ChatGPT",
              description: "Ask questions about this page",
              onClick: () =>
                openInLLM(
                  (url) =>
                    `https://chat.openai.com/?hints=search&q=Read%20from%20${encodeURIComponent(
                      url
                    )}%20so%20I%20can%20ask%20questions%20about%20it.`
                ),
            },
            {
              icon: <FaCommentDots className="w-4 h-4" />,
              label: "Open in Claude",
              description: "Ask questions about this page",
              onClick: () =>
                openInLLM(
                  (url) =>
                    `https://claude.ai/?q=Read%20from%20${encodeURIComponent(
                      url
                    )}%20so%20I%20can%20ask%20questions%20about%20it.`
                ),
            },
          ].map(({ icon, label, description, onClick }) => (
            <DropdownMenuItem
              key={label}
              className="flex items-start gap-3 p-2 text-sm text-gray-800 hover:bg-gray-100 rounded-md cursor-pointer"
              onClick={onClick}
            >
              <span className="flex items-center justify-center w-8 h-8 bg-white border border-gray-200 rounded-md">
                {icon}
              </span>
              <span className="flex flex-col">
                <span className="font-medium">{label}</span>
                <span className="text-xs text-gray-500 font-light">
                  {description}
                </span>
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
