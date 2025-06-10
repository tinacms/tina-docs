"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const themes = [
  "default",
  "monochrome",
  "blossom",
  "lake",
  "pine-green",
  "pine-indigo",
];

export function ThemeSelector() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(theme);

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
    }
  }, [selectedTheme, resolvedTheme, mounted]);

  if (!mounted) return null;

  const handleThemeChange = (newTheme: string) => {
    // Store the current mode
    const currentMode = resolvedTheme;
    // Update the theme
    setSelectedTheme(newTheme);
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
      <select
        value={selectedTheme}
        onChange={(e) => handleThemeChange(e.target.value)}
        className="w-full rounded-md border border-neutral-border bg-neutral-surface px-3 py-2 text-sm text-neutral-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
      >
        {themes.map((t) => (
          <option key={t} value={t}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}
