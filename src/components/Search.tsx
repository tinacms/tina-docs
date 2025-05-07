"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    pagefind: any;
  }
}

export default function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPagefindLoaded, setIsPagefindLoaded] = useState(false);
  const isDevelopment = process.env.NODE_ENV === "development";

  useEffect(() => {
    // Only load Pagefind in production
    if (isDevelopment) {
      return;
    }

    // Load Pagefind script
    const loadPagefind = async () => {
      try {
        const script = document.createElement("script");
        script.src = "/pagefind/pagefind.js";
        script.async = true;

        script.onload = () => {
          setIsPagefindLoaded(true);
        };

        script.onerror = () => {
          // biome-ignore lint/suspicious/noConsole: Development error logging
          console.error("Failed to load Pagefind script");
        };

        document.body.appendChild(script);

        return () => {
          if (document.body.contains(script)) {
            document.body.removeChild(script);
          }
        };
      } catch (error) {
        // biome-ignore lint/suspicious/noConsole: Development error logging
        console.error("Error loading Pagefind:", error);
      }
    };

    loadPagefind();
  }, [isDevelopment]);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (!value.trim() || !isPagefindLoaded || isDevelopment) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const search = await window.pagefind.search(value);
      const searchResults = await Promise.all(
        search.results.map(async (result: any) => {
          const data = await result.data();
          return {
            url: result.url,
            title: data.meta.title,
            excerpt: data.excerpt,
          };
        })
      );
      setResults(searchResults);
    } catch (error) {
      if (isDevelopment) {
        // biome-ignore lint/suspicious/noConsole: Development error logging
        console.error("Search error:", error);
      }
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder={
            isDevelopment
              ? "Search will be available in production"
              : "Search documentation..."
          }
          className="w-full px-4 py-2 pl-10 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isDevelopment}
        />
        <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>

      {isLoading && (
        <div className="absolute w-full mt-2 p-4 bg-white rounded-lg shadow-lg">
          <p className="text-gray-500">Searching...</p>
        </div>
      )}

      {!isLoading && results.length > 0 && (
        <div className="absolute w-full mt-2 bg-white rounded-lg shadow-lg">
          {results.map((result, index) => (
            <a
              key={index}
              href={result.url}
              className="block p-4 hover:bg-gray-50 border-b last:border-b-0"
            >
              <h3 className="font-medium text-blue-600">{result.title}</h3>
              <p className="mt-1 text-sm text-gray-600">{result.excerpt}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
