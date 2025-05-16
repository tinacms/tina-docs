"use client";
import React, { useState, useEffect } from "react";
import copy from "copy-to-clipboard";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@radix-ui/react-dropdown-menu";
import htmlToMd from "html-to-md";

import { ClipboardList, Bot, FileText, ChevronDown } from "lucide-react";

interface AIExportButtonProps {
  title?: string;
}

export const AIExportButton: React.FC<AIExportButtonProps> = ({
  title = "Documentation Page",
}) => {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  if (typeof window === "undefined") {
    return null;
  }

  const htmlContent = document.getElementById("doc-content")?.innerHTML || "";

  const handleCopy = async () => {
    const md = htmlToMd(htmlContent);
    const currentUrl = window.location.href;
    const encodedUrl = encodeURIComponent(currentUrl);
    const chatUrl = `https://chat.openai.com/?hints=search&q=Read%20from%20${encodedUrl}%20so%20I%20can%20ask%20questions%20about%20it.`;
    const annotated = `${title}\n\n${md}\n\n---\nAsk questions about this page:\n- [Open in ChatGPT](https://chat.openai.com/chat)\n- [Open in Claude](https://claude.ai/)`;
    copy(annotated);
    setCopied(true);
  };

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  const handleViewAsMarkdown = async () => {
    const md = htmlToMd(htmlContent);

    // Get the current path, remove leading slash, and add .md
    let pathName = window.location.pathname.replace(/^\//, ""); // e.g. docs/guide/intro
    if (!pathName) pathName = "index"; // fallback for homepage
    const filename = `${pathName}.md`;

    const res = await fetch("/api/export-md", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: md, filename }),
    });

    if (res.ok) {
      const data = await res.json();
      window.open(data.url, "_blank");
    } else {
      alert("Failed to export markdown");
    }
  };

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 4000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  return (
    <div className="inline-flex rounded-xl overflow-hidden bg-white border-gray-200 font-medium text-gray-300 ">
      {/* Left button: Copy page */}
      <button
        onClick={handleCopy}
        className={`flex flex-row items-center gap-1 rounded-l-xl px-3 text-gray-700 dark:text-gray-300 py-1 border border-gray-200 dark:border-white/[0.07] bg-background-light dark:bg-background-dark hover:bg-gray-600/5 dark:hover:bg-gray-200/5 border-r-0
    ${
      copied
        ? "bg-green-100 text-green-800"
        : "bg-white text-gray-400 hover:bg-gray-200 active:bg-gray-300"
    }
    cursor-pointer`}
        type="button"
      >
        <ClipboardList className="w-4 h-4" />
        <span>{copied ? "Copied!" : "Copy page"}</span>
      </button>

      {/* Right dropdown arrow */}
      <DropdownMenu onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild className="border-gray-200">
          <button
            className="px-3 border border-gray-200 hover:bg-gray-50 rounded-r-xl cursor-pointer rounded-l-none"
            type="button"
            onClick={handleToggle}
          >
            <ChevronDown
              className={`w-4 h-4 text-gray-600 transform transition-transform duration-200 ${
                open ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="bg-white rounded-2xl shadow-xl mt-2 border-0 border-gray-200 w-72 z-50 p-1 focus-visible:outline-0 hover:outline-0">
          <DropdownMenuItem
            onClick={handleCopy}
            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer rounded-md"
          >
            <ClipboardList className="w-4 h-4 text-gray-600" />
            Copy page as Markdown for LLMs
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleViewAsMarkdown}
            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer rounded-md"
          >
            <FileText className="w-4 h-4 text-gray-600" />
            View as Markdown
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer rounded-md"
            onClick={() => {
              window.open(
                `https://chat.openai.com/?hints=search&q=Read%20from%20${encodeURIComponent(
                  window.location.href
                )}%20so%20I%20can%20ask%20questions%20about%20it.`,
                "_blank",
                "noopener,noreferrer"
              );
            }}
          >
            <Bot className="w-4 h-4 text-gray-600" />
            Open in ChatGPT (Manual Paste)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
