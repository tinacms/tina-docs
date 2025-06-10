"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const themes = [
  "default",
  "monochrome",
  "blossom",
  "lake",
  "pine",
  "pine-green",
  "pine-indigo",
];

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-neutral-surface p-2 rounded-lg shadow-lg">
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
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
