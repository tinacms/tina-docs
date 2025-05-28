"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { IoMoon, IoSunny } from "react-icons/io5";

export default function LightDarkSwitch() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isLight = resolvedTheme === "light";

  return (
    <button
      type="button"
      className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ease-in-out cursor-pointer"
      onClick={() => setTheme(isLight ? "dark" : "light")}
    >
      {mounted ? (
        isLight ? (
          <IoSunny
            size={20}
            className="text-brand-primary transition-colors duration-300"
          />
        ) : (
          <IoMoon
            size={19}
            className="text-neutral-text transition-colors duration-300"
          />
        )
      ) : (
        <div className="w-5 h-5 rounded-full animate-pulse opacity-20" />
      )}
    </button>
  );
}
