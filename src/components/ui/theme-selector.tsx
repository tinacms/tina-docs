"use client";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { MdArrowDropDown } from "react-icons/md";

const themes = ["default", "monochrome", "blossom", "lake", "pine", "indigo"];

const BROWSER_TAB_THEME_KEY = "browser-tab-theme";

// Default theme colors from root
const DEFAULT_COLORS = {
  background: "#ecf8fb",
  text: "#EC4815",
  border: "#EC4815",
};

export const ThemeSelector = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
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
