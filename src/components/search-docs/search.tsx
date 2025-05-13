"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { SearchResults } from "./search-results";

const isDev = process.env.NODE_ENV === "development";

// The production path doesn't locate the pagefind-entry.json, as it's treated as its own route.
// This workaround ensures the pagefind-entry.json can be found.
// For development, the pagefind-entry.json must be located at the root of the project.
const pagefindPath = isDev ? "/pagefind" : "/_next/static/pagefind";

export function Search({ className }: { className?: string }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setError(null);

    if (!value.trim()) {
      setResults([]);
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

            const searchTerm = value.toLowerCase();
            const textToSearch = `${data.meta.title || ""} ${
              data.excerpt
            }`.toLowerCase();

            const words = textToSearch.match(/\w+/g) || [];

            const matchFound = words.some((word) => {
              const index = (word as string).indexOf(searchTerm);
              return (
                index !== -1 &&
                (word as string).slice(index).startsWith(searchTerm)
              );
            });

            if (!matchFound) return null;

            return {
              url: data.raw_url.split(".")[0],
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
    <div className="relative w-full md:max-w-2xl mx-auto my-8 md:mb-4 md:mt-2">
      <div className={`relative md:mr-4 ${className || ""}`}>
        <input
          type="text"
          value={searchTerm}
          className={`w-full text-neutral-text mt-2 p-2 pl-6 rounded-full bg-neutral-background-tertiary shadow-lg focus:outline-none focus:ring-1 focus:ring-[#0574e4]/50 focus:border-[#0574e4]/50 transition-all ${
            error !== null ? "opacity-50 cursor-not-allowed" : ""
          }`}
          placeholder="Search..."
          onChange={handleSearch}
          disabled={error !== null}
        />
        <MagnifyingGlassIcon className="mt-1 absolute right-3 top-1/2 transform -translate-y-1/2 text-brand-primary h-5 w-5" />
      </div>

      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm w-11/12 mx-auto">
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
