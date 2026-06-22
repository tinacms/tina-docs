"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SearchResults } from "./search-results";

const isDev = process.env.NODE_ENV === "development";
// In development, the pagefind-entry.json is served from the root of the project.
// In production, it is served from the _next/static/pagefind directory.
const pagefindPath = isDev
  ? "/pagefind"
  : `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/_next/static/pagefind`;

export function SearchDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  // Index of the result highlighted for keyboard (arrow-key) navigation.
  const [activeIndex, setActiveIndex] = useState(0);
  // Monotonic id so a slow, out-of-order Pagefind response can't overwrite a
  // newer one. The dialog panel ref backs the Tab focus trap.
  const latestRequest = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll, close on Escape, and trap Tab focus inside the dialog
  // while open. (Input focus is handled by the input's `autoFocus`, which is
  // reliable across headless environments.)
  useEffect(() => {
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el.offsetParent !== null);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      // Wrap at the ends, and pull focus back if it ever escaped the panel.
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      } else if (!panelRef.current.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setError(null);
    // A new query starts the highlight back at the top.
    setActiveIndex(0);

    if (!value.trim()) {
      latestRequest.current++;
      setResults([]);
      setSearchTerm("");
      setIsLoading(false);
      return;
    }

    const requestId = ++latestRequest.current;
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

        // A newer keystroke already kicked off a fresh search — drop this
        // (possibly out-of-order) response so it can't clobber the newer one.
        if (requestId !== latestRequest.current) return;

        setResults(filteredResults);
        setActiveIndex(0);
      }
    } catch (error) {
      if (requestId !== latestRequest.current) return;
      setError("An error occurred while searching. Please try again.");
      setResults([]);
    } finally {
      // Only the latest request owns the loading flag.
      if (requestId === latestRequest.current) setIsLoading(false);
    }
  };

  // Arrow keys move the highlight; Enter opens the highlighted result. This
  // mirrors the command-palette behaviour users expect from ⌘/Ctrl + K search.
  const handleKeyNav = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // While a fresh search is in flight the visible results are stale, so don't
    // let Enter open one that's about to be replaced.
    if (isLoading || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      const active = results[activeIndex];
      if (active?.url) {
        e.preventDefault();
        onClose();
        router.push(active.url);
      }
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-[12vh] backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={panelRef}
        className="flex w-full max-w-xl flex-col overflow-hidden rounded-xl border border-neutral-border/50 bg-neutral-background shadow-2xl animate-zoom-in dark:border-neutral-border-subtle/60"
        // biome-ignore lint/a11y/useSemanticElements: a portal'd command palette needs role="dialog" + aria-modal; native <dialog> doesn't fit this createPortal/backdrop setup and isn't used elsewhere in this codebase
        role="dialog"
        aria-modal="true"
        aria-label="Search documentation"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input row */}
        <div className="flex items-center gap-3 border-b border-neutral-border/50 px-4 dark:border-neutral-border-subtle/60">
          <MagnifyingGlassIcon className="h-5 w-5 shrink-0 text-brand-primary" />
          <input
            // biome-ignore lint/a11y/noAutofocus: focusing the field is the point of opening the search overlay
            autoFocus
            type="text"
            value={searchTerm}
            className="w-full bg-transparent py-4 text-neutral-text placeholder:text-neutral-text-secondary focus:outline-none"
            placeholder="Search..."
            onChange={handleSearch}
            onKeyDown={handleKeyNav}
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls="search-results-listbox"
            aria-activedescendant={
              results.length > 0
                ? `search-result-option-${activeIndex}`
                : undefined
            }
            aria-autocomplete="list"
          />
          <kbd className="hidden shrink-0 select-none items-center rounded-md border border-neutral-border/60 bg-neutral-background-secondary px-1.5 py-0.5 text-xs font-medium text-neutral-text-secondary sm:flex dark:border-neutral-border-subtle/60">
            Esc
          </kbd>
        </div>

        {/* Results / state area */}
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {error ? (
            <div className="m-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          ) : (
            <SearchResults
              results={results}
              isLoading={isLoading}
              searchTerm={searchTerm}
              activeIndex={activeIndex}
              onActivate={setActiveIndex}
              onSelect={onClose}
            />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
