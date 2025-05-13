"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { SearchResults } from "./search-docs/search-results";

const isDev = process.env.NODE_ENV === "development";
const pagefindPath = isDev ? "/pagefind" : "/_next/static/pagefind";

export default function Search({ className }: { className?: string }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (!value.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);

    try {
      if (typeof window !== "undefined") {
        console.log("🚀 ~ handleSearch ~ pagefindPath:", pagefindPath);
        const pagefindModule = await (window as any).eval(
          `import("${pagefindPath}/pagefind.js")`
        );
        const search = await pagefindModule.search(value);

        const searchResults = await Promise.all(
          search.results.map(async (result: any) => {
            const data = await result.data();

            // Normalize and tokenize text for exact word matching
            const searchTerm = value.toLowerCase();
            const textToSearch = `${data.meta.title || ""} ${
              data.excerpt
            }`.toLowerCase();

            const words = textToSearch.match(/\w+/g) || [];

            // Look for any word that contains the search term starting at any position
            const matchFound = words.some((word) => {
              const index = (word as string).indexOf(searchTerm);
              return (
                index !== -1 &&
                (word as string).slice(index).startsWith(searchTerm)
              );
            });

            if (!matchFound) return null;

            return {
              url: data.raw_url,
              title: data.meta.title || "Untitled",
              excerpt: data.excerpt,
            };
          })
        );

        // Remove null entries (non-matching results)
        const filteredResults = searchResults.filter(Boolean);

        setResults(filteredResults);
      }
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full md:max-w-2xl mx-auto my-8 md:mb-4 md:mt-2">
      <div className={`relative md:mx-3 ${className || ""}`}>
        <input
          type="text"
          value={searchTerm}
          className="w-full p-2 pl-6 rounded-full border border-gray-300/20 bg-white/50 shadow-lg focus:outline-none focus:ring-1 focus:ring-[#0574e4]/50 focus:border-[#0574e4]/50 transition-all"
          placeholder="Search documentation..."
          onChange={handleSearch}
        />
        <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orange-600 h-5 w-5" />
      </div>

      <SearchResults
        results={results}
        isLoading={isLoading}
        searchTerm={searchTerm}
      />
    </div>
  );
}
