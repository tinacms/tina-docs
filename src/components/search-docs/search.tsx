"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import { SearchResults } from "./search-results";

const isDev = process.env.NODE_ENV === "development";
// In development, the pagefind-entry.json is served from the root of the project.
// In production, it is served from the _next/static/pagefind directory.
const pagefindPath = isDev
  ? "/pagefind"
  : `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/_next/static/pagefind`;

export function Search({ className }: { className?: string }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setResults([]);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Open search with cmd/ctrl + k from anywhere on the page.
  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };

    document.addEventListener("keydown", handleShortcut);
    return () => {
      document.removeEventListener("keydown", handleShortcut);
    };
  }, []);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setError(null);

    if (!value.trim()) {
      setResults([]);
      setSearchTerm("");
      return;
    }

    setIsLoading(true);

    try {
      if (typeof window !== "undefined") {
        let pagefindModule: any;
        try {
          // pagefind.js is generated at build time and lives outside the bundle. The
          // webpackIgnore/turbopackIgnore comments tell both bundlers to leave this dynamic
          // import alone (the reason the old code resorted to `window.eval`), emitting it as a
          // runtime import. Avoiding `eval` means no CSP 'unsafe-eval' is required, which is
          // what was breaking search under Chromium's stricter enforcement.
          const pagefindUrl = new URL(
            `${pagefindPath}/pagefind.js`,
            window.location.origin
          ).href;

          pagefindModule = await import(
            /* webpackIgnore: true */
            /* turbopackIgnore: true */
            pagefindUrl
          );
        } catch (importError) {
          // Surface the real cause (CSP, MIME type, or 404) instead of swallowing it.
          // biome-ignore lint/suspicious/noConsole: needed to diagnose load failures in prod
          console.error("Pagefind failed to load:", importError);
          setError(
            "Unable to load search functionality. For more information, please check this README: https://github.com/tinacms/tina-docs?tab=readme-ov-file#search-functionality and refresh the page."
          );
          return;
        }

        const search = await pagefindModule.search(value);

        const searchResults = await Promise.all(
          search.results.map(async (result: any) => {
            const data = await result.data();

            const searchTerms = value.toLowerCase().match(/\w+/g) || [];
            const textToSearch = `${data.meta.title || ""} ${
              data.excerpt
            }`.toLowerCase();

            const words = textToSearch.match(/\w+/g) || [];

            const matchFound = searchTerms.every((term) =>
              words.some((word: string) => word.includes(term))
            );

            if (!matchFound) return null;

            return {
              url: data.raw_url
                .replace(/^\/server\/app/, "")
                .replace(/\.html$/, "")
                .replace(/\/+/g, "/")
                .trim(),
              title: data.meta.title || "Untitled",
              excerpt: data.excerpt,
            };
          })
        );

        const filteredResults = searchResults.filter(Boolean);

        setResults(filteredResults);
      }
    } catch (error) {
      setError("An error occurred while searching. Please try again.");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative w-full md:max-w-lg lg:my-4 lg:mb-4"
      ref={searchContainerRef}
    >
      <div className={`relative md:mr-4 ${className || ""}`}>
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          className={`w-full text-neutral-text p-1 lg:p-2 lg:pl-6 pl-6 rounded-full bg-neutral-background-secondary shadow-lg border border-neutral-border/50 dark:border-neutral-border-subtle/50 focus:outline-none focus:ring-1 focus:ring-[#0574e4]/50 focus:border-[#0574e4]/50 transition-all ${
            error !== null ? "opacity-50 cursor-not-allowed" : ""
          }`}
          placeholder="Search..."
          onChange={handleSearch}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setResults([]);
              setSearchTerm("");
              inputRef.current?.blur();
            }
          }}
        />
        <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-brand-primary h-5 w-5" />
      </div>

      {error && (
        <div className="md:mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm w-11/12 mx-auto absolute left-3 z-10">
          {error}
        </div>
      )}

      {!error && (
        <SearchResults
          results={results}
          isLoading={isLoading}
          searchTerm={searchTerm}
        />
      )}
    </div>
  );
}
