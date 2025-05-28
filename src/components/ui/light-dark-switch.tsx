"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { IoMoon, IoSunny } from "react-icons/io5";

export default function LightDarkSwitch() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Prevent hydration mismatch by not rendering anything until mounted
  if (!mounted) {
    return null;
  }

  const isLight = resolvedTheme === "light";

  return (
    <div className="brand-glass-gradient w-fit rounded-full p-1 shadow-xl dark:border dark:border-neutral-border-subtle">
      <button
        type="button"
        className="flex items-center gap-4 cursor-pointer"
        onClick={() => setTheme(isLight ? "dark" : "light")}
      >
        <div
          className={`w-fit rounded-full p-1 transition-all duration-300 ease-in-out ${
            isLight
              ? "bg-neutral-border text-brand-primary"
              : "text-neutral-text"
          }`}
        >
          <IoSunny size={20} className="transition-colors duration-300" />
        </div>
        <div
          className={`w-fit rounded-full p-1 transition-all duration-300 ease-in-out border border-transparent ${
            isLight
              ? "text-neutral-text-secondary"
              : "text-neutral-text bg-neutral-border-subtle"
          }`}
        >
          <IoMoon size={19} className="transition-colors duration-300" />
        </div>
      </button>
    </div>
  );
}
