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
  onSelect?: () => void;
}

const stateMessage =
  "py-6 px-4 text-center text-md font-inter font-semibold text-neutral-text-secondary";

export function SearchResults({
  results,
  isLoading,
  searchTerm,
  onSelect,
}: SearchResultsProps) {
  if (isLoading) {
    return (
      <div data-testid="search-results-container">
        <p className={`${stateMessage} text-brand-primary`}>
          Mustering all the Llamas...
        </p>
      </div>
    );
  }

  if (results.length > 0) {
    return (
      <div data-testid="search-results-container">
        {results.map((result, index) => (
          <Link
            key={index}
            href={result.url}
            onClick={onSelect}
            className="block rounded-lg p-3 hover:bg-neutral-background-secondary group transition-colors"
          >
            <h3 className="font-medium text-brand-primary group-hover:text-orange-400">
              {result.title}
            </h3>
            <p
              className="mt-1 text-sm text-neutral-text-secondary line-clamp-2"
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
      <div data-testid="search-results-container">
        <p className={stateMessage} data-testid="no-results-message">
          No Llamas Found...
        </p>
      </div>
    );
  }

  // Empty input: prompt the user so the open dialog has clear, visible feedback
  // rather than sitting blank.
  return (
    <div data-testid="search-results-container">
      <p className={stateMessage} data-testid="search-prompt-message">
        Start searching the llamas...
      </p>
    </div>
  );
}
