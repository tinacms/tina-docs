"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useCallback, useEffect, useState } from "react";
import { SearchDialog } from "./search-dialog";

export function Search({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const closeSearch = useCallback(() => setIsOpen(false), []);
  // Resolved on the client so we can show the platform-correct shortcut without
  // a hydration mismatch (the server has no way to know the user's OS).
  const [shortcutHint, setShortcutHint] = useState<string | null>(null);

  useEffect(() => {
    const platform =
      (navigator as { userAgentData?: { platform?: string } }).userAgentData
        ?.platform ||
      navigator.platform ||
      "";
    setShortcutHint(
      /mac|iphone|ipad|ipod/i.test(platform) ? "⌘ + K" : "Ctrl + K"
    );
  }, []);

  // Open the search overlay with cmd/ctrl + k from anywhere on the page.
  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener("keydown", handleShortcut);
    return () => {
      document.removeEventListener("keydown", handleShortcut);
    };
  }, []);

  return (
    <div className="w-full md:max-w-lg lg:my-4 lg:mb-4">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Search"
        aria-haspopup="dialog"
        data-testid="search-trigger"
        className={`group flex w-full items-center gap-2 rounded-full border border-neutral-border/50 bg-neutral-background-secondary p-1 pl-6 pr-2 text-left shadow-lg transition-colors hover:border-[#0574e4]/50 md:mr-4 lg:p-2 lg:pl-6 dark:border-neutral-border-subtle/50 ${
          className || ""
        }`}
      >
        <span className="flex-1 text-neutral-text-secondary">Search...</span>
        {shortcutHint && (
          <kbd className="hidden select-none items-center rounded-md border border-neutral-border/60 bg-neutral-background px-1.5 py-0.5 text-xs font-medium text-neutral-text-secondary sm:flex dark:border-neutral-border-subtle/60">
            {shortcutHint}
          </kbd>
        )}
        <MagnifyingGlassIcon className="h-5 w-5 text-brand-primary" />
      </button>

      {isOpen && <SearchDialog onClose={closeSearch} />}
    </div>
  );
}
