"use client";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { MdArrowDropDown } from "react-icons/md";
import { MdHelpOutline } from "react-icons/md";

const themes = ["default", "tina", "blossom", "lake", "pine", "indigo"];

export const BROWSER_TAB_THEME_KEY = "browser-tab-theme";

// Default theme colors from root
const DEFAULT_COLORS = {
  background: "#FFFFFF",
  text: "#000000",
  border: "#000000",
};

export const ThemeSelector = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [selectedTheme, setSelectedTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem(BROWSER_TAB_THEME_KEY) || theme;
    }
    return theme;
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        setShowTooltip(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update selected theme when theme changes from dropdown
  useEffect(() => {
    if (theme && !themes.includes(theme)) {
      // If theme is not in our list, it means it's a dark/light mode change
      setSelectedTheme(selectedTheme);
    } else {
      setSelectedTheme(theme);
    }
  }, [theme, selectedTheme]);

  useEffect(() => {
    if (mounted && selectedTheme) {
      const isDark = resolvedTheme === "dark";
      document.documentElement.className = `theme-${selectedTheme}${
        isDark ? " dark" : ""
      }`;
      sessionStorage.setItem(BROWSER_TAB_THEME_KEY, selectedTheme);
    }
  }, [selectedTheme, resolvedTheme, mounted]);

  if (!mounted) return null;

  const handleThemeChange = (newTheme: string) => {
    const currentMode = resolvedTheme;
    setSelectedTheme(newTheme);
    sessionStorage.setItem(BROWSER_TAB_THEME_KEY, newTheme);
    setIsOpen(false);
    if (currentMode === "dark") {
      setTheme("light");
      setTimeout(() => setTheme("dark"), 0);
    } else {
      setTheme("light");
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-neutral-surface p-1 rounded-lg shadow-lg">
      <div className="relative" ref={dropdownRef}>
        <div className="flex items-center gap-2">
          <div className="relative" ref={tooltipRef}>
            <button
              type="button"
              onClick={() => setShowTooltip(!showTooltip)}
              className="w-6 h-6 rounded-full bg-neutral-hover hover:bg-neutral-border flex items-center justify-center text-neutral-text transition-colors"
              aria-label="Theme help"
            >
              <MdHelpOutline className="w-4 h-4" />
            </button>

            {showTooltip && <Tooltip selectedTheme={selectedTheme} />}
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-[120px] rounded-md border border-neutral-border bg-neutral-surface px-3 py-1 text-sm text-neutral-text focus:outline-none focus:ring-2 focus:ring-brand-primary flex items-center justify-between cursor-pointer"
          >
            <span className="truncate">
              {selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1)}
            </span>
            <MdArrowDropDown
              className={`w-4 h-4 text-brand-secondary-dark-dark transition-transform duration-200 flex-shrink-0 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {isOpen && (
          <div className="absolute bottom-full left-0 right-0 mb-1 bg-neutral-surface rounded-md border border-neutral-border shadow-lg overflow-hidden w-[120px]">
            {themes.map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => handleThemeChange(t)}
                className={`w-full px-3 py-1 text-sm text-left hover:bg-neutral-hover transition-colors cursor-pointer first:rounded-t-md last:rounded-b-md my-0.25 first:mt-0 last:mb-0 ${
                  t === "default" ? "" : `theme-${t}`
                } ${t === selectedTheme ? "bg-neutral-hover" : ""}`}
                style={{
                  backgroundColor:
                    t === "default"
                      ? DEFAULT_COLORS.background
                      : "var(--brand-primary-light)",
                  color:
                    t === "default"
                      ? DEFAULT_COLORS.text
                      : "var(--brand-primary)",
                  border:
                    t === "default"
                      ? `1px solid ${DEFAULT_COLORS.border}`
                      : "1px solid var(--brand-primary)",
                }}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Tooltip = ({ selectedTheme }: { selectedTheme: string }) => {
  return (
    <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-neutral-surface border border-neutral-border rounded-lg shadow-lg text-xs text-neutral-text min-w-fit">
      <div className="font-medium mb-2">Theme Preview</div>
      <p className="mb-2">
        Theme changes are temporary and will reset when you open a new browser
        window or tab.
      </p>
      <p className="mb-2">
        To make theme changes permanent, update the{" "}
        <code className="bg-neutral-hover px-1 rounded">Selected Theme</code>{" "}
        field in your Settings through TinaCMS:
      </p>
      <code className="block bg-neutral-hover p-2 rounded text-xs font-mono">
        selectedTheme={selectedTheme}
      </code>
      <div className="absolute top-full right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-neutral-border" />
    </div>
  );
};
