"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { MdArrowDropDown } from "react-icons/md";

const themes = [
  "default",
  "monochrome",
  "blossom",
  "lake",
  "pine-green",
  "pine-indigo",
];

const BROWSER_TAB_THEME_KEY = "browser-tab-theme";

export const ThemeSelector = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(() => {
    // Initialize from sessionStorage if available
    if (typeof window !== "undefined") {
      return sessionStorage.getItem(BROWSER_TAB_THEME_KEY) || theme;
    }
    return theme;
  });

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
    // Force the mode to stay the same by toggling it twice
    if (currentMode === "dark") {
      setTheme("light");
      setTimeout(() => setTheme("dark"), 0);
    } else {
      setTheme("light");
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-neutral-surface p-2 rounded-lg shadow-lg">
      <div className="relative">
        <select
          value={selectedTheme}
          onChange={(e) => handleThemeChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setIsOpen(false)}
          className="w-full rounded-md border border-neutral-border bg-neutral-surface px-3 py-2 text-sm text-neutral-text focus:outline-none focus:ring-2 focus:ring-brand-primary appearance-none pr-8"
        >
          {themes.map((t) => (
            <option key={t} value={t}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>
        <div
          className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <MdArrowDropDown
            className={`w-4 h-4 text-brand-secondary-dark-dark transition-transform duration-200 ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </div>
      </div>
    </div>
  );
};
