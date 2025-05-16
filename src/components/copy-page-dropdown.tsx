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

import { Copy, FileCode, Bot, ChevronDown } from "lucide-react";

interface AIExportButtonProps {
  title?: string;
}

export const AIExportButton: React.FC<AIExportButtonProps> = ({
  title = "Documentation Page",
}) => {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const [mdUrl, setMdUrl] = useState<string | null>(null);

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
      setMdUrl(window.location.origin + data.url);
      window.open(data.url, "_blank");
    } else {
      alert("Failed to export markdown");
    }
  };

  // Utility to generate and upload markdown, returns the .md URL
  const generateAndGetMdUrl = async () => {
    let url = mdUrl;
    if (!url) {
      const md = htmlToMd(htmlContent);
      let pathName = window.location.pathname.replace(/^\//, "");
      if (!pathName) pathName = "index";
      const filename = `${pathName}.md`;

      const res = await fetch("/api/export-md", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: md, filename }),
      });

      if (res.ok) {
        const data = await res.json();
        url = window.location.origin + data.url;
        setMdUrl(url);
      } else {
        alert("Failed to export markdown");
        return null;
      }
    }
    return url;
  };

  // Generic function to open a service with the .md link
  const openWithLink = async (
    serviceUrlTemplate: (mdUrl: string) => string
  ) => {
    const url = await generateAndGetMdUrl();
    if (!url) return;
    const finalUrl = serviceUrlTemplate(url);
    window.open(finalUrl, "_blank", "noopener,noreferrer");
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
        <Copy className="w-4 h-4" />
        <span>{copied ? "Copied!" : "Copy page"}</span>
      </button>

      {/* Right dropdown arrow */}
      <DropdownMenu onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild className="border-gray-200">
          <button
            className="px-3 border border-gray-200 hover:bg-gray-50 rounded-r-xl cursor-pointer rounded-l-none outline-none focus:outline-none focus-visible:outline-none"
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
            className="flex items-start gap-3 p-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer rounded-md outline-none focus:outline-none"
            onClick={handleCopy}
          >
            <span className="flex items-center justify-center w-8 h-8 border border-gray-200 rounded-md bg-white focus-visible:outline-none focus:outline-none">
              <Copy className="w-4 h-4 text-gray-600" />
            </span>
            <span className="flex flex-col">
              <span className="font-medium">Copy page</span>
              <span className="text-xs text-gray-500 font-light">
                Copy page as Markdown for LLMs
              </span>
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleViewAsMarkdown}
            className="flex items-start gap-3 p-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer rounded-md outline-none focus:outline-none"
          >
            <span className="flex items-center justify-center w-8 h-8 border border-gray-200 rounded-md bg-white focus-visible:outline-none focus:outline-none">
              <FileCode className="w-4 h-4 text-gray-600" />
            </span>
            <span className="flex flex-col">
              <span className="font-medium">View as Markdown</span>
              <span className="text-xs text-gray-500 font-light">
                View this page as plain text
              </span>
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-start gap-3 p-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer rounded-md outline-none focus:outline-none"
            onClick={() =>
              openWithLink(
                (mdUrl) =>
                  `https://chat.openai.com/?hints=search&q=Read%20from%20${encodeURIComponent(
                    mdUrl
                  )}%20so%20I%20can%20ask%20questions%20about%20it.`
              )
            }
          >
            <span className="flex items-center justify-center w-8 h-8 border border-gray-200 rounded-md bg-white focus-visible:outline-none focus:outline-none">
              <Bot className="w-4 h-4 text-gray-600" />
            </span>
            <span className="flex flex-col">
              <span className="font-medium">Open in ChatGPT</span>
              <span className="text-xs text-gray-500 font-light">
                Ask questions about this page
              </span>
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-start gap-3 p-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer rounded-md outline-none focus:outline-none"
            onClick={() =>
              openWithLink(
                (mdUrl) =>
                  `https://claude.ai/?q=Read%20from%20${encodeURIComponent(
                    mdUrl
                  )}%20so%20I%20can%20ask%20questions%20about%20it.`
              )
            }
          >
            <span className="flex items-center justify-center w-8 h-8 border border-gray-200 rounded-md bg-white focus-visible:outline-none focus:outline-none">
              <FileCode className="w-4 h-4 text-gray-600" />
            </span>
            <span className="flex flex-col">
              <span className="font-medium">Open in Claude</span>
              <span className="text-xs text-gray-500 font-light">
                Ask questions about this page
              </span>
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
