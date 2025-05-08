"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

const isDev = process.env.NODE_ENV === "development";
const pagefindPath = isDev ? "/pagefind" : "/public/pagefind";

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
        const pagefindModule = await (window as any).eval(
          `import("${pagefindPath}/pagefind.js")`
        );
        const search = await pagefindModule.search(value);

        const searchResults = await Promise.all(
          search.results.map(async (result: any) => {
            const data = await result.data();
            // biome-ignore lint/suspicious/noConsole: <explanation>
            console.log("🚀 ~ search.results.map ~ data:", data);
            return {
              url: data.raw_url,
              title: data.meta.title || "Untitled",
              excerpt: data.excerpt,
            };
          })
        );

        setResults(searchResults);
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

      {isLoading && (
        <div className="absolute w-full mt-2 p-4 bg-white rounded-lg shadow-lg z-10">
          <h4 className="text-orange-700 text-bold">
            Mustering all the Llamas...
          </h4>
        </div>
      )}

      {!isLoading && results.length > 0 && (
        <div className="absolute md:w-11/12 w-full mt-2 max-h-[50vh] overflow-y-auto bg-white rounded-lg shadow-lg z-10 left-1/2 -translate-x-1/2">
          {results.map((result, index) => (
            <a
              key={index}
              href={result.url}
              className="block p-4 border-b-1 border-b-gray-200 last:border-b-0 group"
            >
              <h3 className="font-medium text-blue-600 group-hover:text-orange-400">
                {result.title}
              </h3>
              <p
                className="mt-1 text-sm text-gray-600"
                // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
                dangerouslySetInnerHTML={{
                  __html: result.excerpt || undefined,
                }}
              />
            </a>
          ))}
        </div>
      )}
      {results.length === 0 && !isLoading && searchTerm.length > 0 && (
        <div className="absolute w-full mt-2 p-4 bg-white z-10 py-2 max-h-[45vh] md:w-11/12 mx-auto rounded-lg shadow-lg left-1/2 -translate-x-1/2">
          <div className="pt-4 px-4 text-md font-inter font-semibold text-gray-500 text-bold">
            No Llamas Found...
          </div>
        </div>
      )}
    </div>
  );
}
