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
          // Using eval to import pagefind.js is a workaround since the script isn't available during the build process.
          // This also improves performance by loading the script only when needed, reducing initial page load time.
          // A direct import would require committing the file with the codebase, which would change frequently
          // with every content update.

          pagefindModule = await (window as any).eval(
            `import("${pagefindPath}/pagefind.js")`
          );
        } catch (importError) {
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
          type="text"
          value={searchTerm}
          className={`w-full text-neutral-text p-1 lg:p-2 lg:pl-6 pl-6 rounded-full bg-neutral-background-secondary shadow-lg border border-neutral-border/50 dark:border-neutral-border-subtle/50 focus:outline-none focus:ring-1 focus:ring-[#0574e4]/50 focus:border-[#0574e4]/50 transition-all ${
            error !== null ? "opacity-50 cursor-not-allowed" : ""
          }`}
          placeholder="Search..."
          onChange={handleSearch}
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
