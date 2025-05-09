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
  "absolute w-full mt-2 p-4 bg-white z-10 py-2 max-h-[45vh] md:w-11/12 mx-auto rounded-lg shadow-lg left-1/2 -translate-x-1/2 overflow-y-auto";

export function SearchResults({
  results,
  isLoading,
  searchTerm,
}: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className={searchResultsContainer}>
        <h4 className="text-orange-500 font-bold my-2">
          Mustering all the Llamas...
        </h4>
      </div>
    );
  }

  if (results.length > 0) {
    return (
      <div className={searchResultsContainer}>
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
              // biome-ignore lint/security/noDangerouslySetInnerHtml: For Highlighting the search term, it is important to use dangerouslySetInnerHTML
              dangerouslySetInnerHTML={{
                __html: result.excerpt || "",
              }}
            />
          </a>
        ))}
      </div>
    );
  }

  if (searchTerm.length > 0) {
    return (
      <div className={searchResultsContainer}>
        <div className="py-2 px-4 text-md font-inter font-semibold text-gray-500 text-bold">
          No Llamas Found...
        </div>
      </div>
    );
  }

  return null;
}
