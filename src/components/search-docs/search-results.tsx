import Link from "next/link";
import { useEffect, useRef } from "react";

interface SearchResult {
  url: string;
  title: string;
  excerpt: string;
}

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  searchTerm: string;
  /** Index of the result currently highlighted for keyboard navigation. */
  activeIndex?: number;
  /** Called when the pointer hovers a result, so hover and arrow keys agree. */
  onActivate?: (index: number) => void;
  onSelect?: () => void;
}

const stateMessage =
  "py-6 px-4 text-center text-md font-inter font-semibold text-neutral-text-secondary";

export function SearchResults({
  results,
  isLoading,
  searchTerm,
  activeIndex = 0,
  onActivate,
  onSelect,
}: SearchResultsProps) {
  const activeRef = useRef<HTMLAnchorElement>(null);

  // Keep the highlighted result in view as the user arrows past the fold.
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-run when the highlight moves; the body reads activeRef, which now points at the newly-active item
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);
  if (isLoading) {
    return (
      <div data-testid="search-results-container">
        <p
          className={`${stateMessage} text-brand-primary`}
          data-testid="search-loading-message"
        >
          Mustering all the Llamas...
        </p>
      </div>
    );
  }

  if (results.length > 0) {
    return (
      <div
        data-testid="search-results-container"
        id="search-results-listbox"
        // biome-ignore lint/a11y/useSemanticElements: a custom keyboard-navigable results widget is an ARIA listbox, not a native <select>
        role="listbox"
        aria-label="Search results"
        tabIndex={-1}
      >
        {results.map((result, index) => {
          const isActive = index === activeIndex;
          return (
            <Link
              key={index}
              ref={isActive ? activeRef : null}
              id={`search-result-option-${index}`}
              href={result.url}
              // biome-ignore lint/a11y/useSemanticElements: an ARIA option inside the listbox, rendered as a link so results stay client-navigable
              role="option"
              onClick={onSelect}
              onMouseMove={() => onActivate?.(index)}
              aria-selected={isActive}
              className={`block rounded-lg p-3 group transition-colors ${
                isActive ? "bg-neutral-background-secondary" : ""
              }`}
            >
              <h3
                className={`font-medium text-brand-primary ${
                  isActive ? "text-orange-400" : ""
                }`}
              >
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
          );
        })}
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
