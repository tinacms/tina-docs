import Link from "next/link";

interface SearchResult {
  url: string;
  title: string;
  excerpt: string;
}

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  searchTerm: string;
}

const searchResultsContainer =
  "absolute mt-2 p-4 z-10 py-2 max-h-[45vh] md:w-11/12 w-full mx-auto rounded-lg shadow-lg md:ml-2 left translate-x-1 overflow-y-auto bg-neutral-background";

export function SearchResults({
  results,
  isLoading,
  searchTerm,
}: SearchResultsProps) {
  if (isLoading) {
    return (
      <div
        className={searchResultsContainer}
        data-testid="search-results-container"
      >
        <h4 className="text-brand-primary font-bold my-2">
          Mustering all the Llamas...
        </h4>
      </div>
    );
  }

  if (results.length > 0) {
    return (
      <div
        className={searchResultsContainer}
        data-testid="search-results-container"
      >
        {results.map((result, index) => (
          <Link
            key={index}
            href={result.url}
            className="block p-2 border-b-1 border-b-gray-200 last:border-b-0 group"
          >
            <h3 className="font-medium text-brand-primary group-hover:text-orange-400">
              {result.title}
            </h3>
            <p
              className="mt-1 text-sm text-neutral-text"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: For Highlighting the search term, it is important to use dangerouslySetInnerHTML
              dangerouslySetInnerHTML={{
                __html: result.excerpt || "",
              }}
            />
          </Link>
        ))}
      </div>
    );
  }

  if (searchTerm.length > 0) {
    return (
      <div
        className={searchResultsContainer}
        data-testid="search-results-container"
      >
        <div
          className="py-2 px-4 text-md font-inter font-semibold text-gray-500 text-bold"
          data-testid="no-results-message"
        >
          No Llamas Found...
        </div>
      </div>
    );
  }

  return null;
}
