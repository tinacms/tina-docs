"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import copy from "copy-to-clipboard";
import htmlToMd from "html-to-md";
import type React from "react";
import { useEffect, useState } from "react";
import { FaCommentDots } from "react-icons/fa";
import {
  MdArrowDropDown,
  MdCheck,
  MdContentCopy,
  MdFilePresent,
} from "react-icons/md";
import { SiOpenai } from "react-icons/si";

interface CopyPageDropdownProps {
  title?: string;
  className?: string;
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
    const elementsToRemove = clone.querySelectorAll("[data-exclude-from-md]");
    for (const el of elementsToRemove) {
      el.remove();
    }
    return clone;
  };

  const convertToMarkdown = (html: string): string => {
    const rawMd = htmlToMd(html);
    return rawMd.replace(/<button>Copy<\/button>\n?/g, "");
  };

  const handleCopyPage = () => {
    const htmlContent = getCleanHtmlContent()?.innerHTML || "";
    const markdown = convertToMarkdown(htmlContent);
    const referenceSection =
      "\n\n---\nAsk questions about this page:\n- [Open in ChatGPT](https://chat.openai.com/chat)\n- [Open in Claude](https://claude.ai/)";
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
      className="mb-2 inline-flex rounded-lg overflow-hidden h-fit lg:mb-0 brand-glass-gradient text-neutral-text-secondary shadow-sm item-center w-fit ml-auto border border-neutral-border-subtle/50"
      data-exclude-from-md
    >
      {/* Primary copy button */}
      <button
        onClick={handleCopyPage}
        className={`cursor-pointer flex items-center px-1.5 py-0.5 ${
          copied
            ? "text-neutral-text-secondary"
            : "text-brand-secondary-dark-dark"
        }`}
        type="button"
      >
        <span>
          {copied ? (
            <span className="flex items-center gap-2">
              <MdCheck className="w-4 h-4" />
              <span>Copied</span>
            </span>
          ) : (
            <span className="flex items-center gap-2 py-1 lg:py-0 text-neutral-text-secondary`">
              <MdContentCopy className="w-4 h-4" />
              <span className="hidden lg:block">Copy</span>
            </span>
          )}
        </span>
      </button>

      {/* Dropdown */}
      <DropdownMenu onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className="cursor-pointer px-3 rounded-r-lg focus:outline-none"
            type="button"
          >
            <MdArrowDropDown
              className={`w-4 h-4 text-brand-secondary-dark-dark transition-transform duration-200 ${
                isOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="z-50 mt-2 w-72 rounded-lg bg-neutral-background dark:border-1 dark:border-neutral-border-subtle shadow-md"
          sideOffset={0}
          align="end"
        >
          {[
            {
              icon: (
                <MdContentCopy className="w-4 h-4 text-neutral-text-secondary" />
              ),
              label: "Copy page",
              description: "Copy page as Markdown for LLMs",
              onClick: handleCopyPage,
            },
            {
              icon: (
                <MdFilePresent className="w-4 h-4 text-neutral-text-secondary" />
              ),
              label: "View as Markdown",
              description: "View this page as plain text",
              onClick: handleViewMarkdown,
            },
            {
              icon: (
                <SiOpenai className="w-4 h-4 text-neutral-text-secondary" />
              ),
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
              icon: (
                <FaCommentDots className="w-4 h-4 text-neutral-text-secondary" />
              ),
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
              className="flex items-start gap-3 p-2 text-sm text-neutral hover:bg-neutral-background-secondary focus:outline-none first:rounded-t-lg last:rounded-b-lg cursor-pointer"
              onClick={onClick}
            >
              <span className="flex items-center justify-center w-8 h-8 border-1 border-neutral-border-subtle rounded-md">
                {icon}
              </span>
              <span className="flex flex-col">
                <span className="font-medium text-neutral-text">{label}</span>
                <span className="text-xs text-neutral-text-secondary font-light">
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
