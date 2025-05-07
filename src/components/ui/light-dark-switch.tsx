"use client";
import { useEffect, useState } from "react";
import { IoSunny, IoMoon } from "react-icons/io5";

export default function LightDarkSwitch() {
  const [isLight, setIsLight] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const isDark = stored === "dark" || (!stored && systemPrefersDark);

    document.documentElement.classList.toggle("dark", isDark);
    setIsLight(!isDark);
  }, []);

  const toggleTheme = () => {
    const newIsLight = !isLight;
    setIsLight(newIsLight);

    const isDark = !newIsLight;
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  };

  return (
    <div className="brand-glass-gradient w-fit rounded-full p-1 shadow-xl">
      <button
        type="button"
        className="flex items-center gap-4 cursor-pointer"
        onClick={toggleTheme}
      >
        <div
          className={`w-fit rounded-full p-1 transition-all duration-300 ease-in-out ${
            isLight
              ? "bg-neutral-background-secondary text-neutral-text"
              : "text-neutral-text"
          }`}
        >
          <IoSunny size={20} className="transition-colors duration-300" />
        </div>
        <div
          className={`w-fit rounded-full p-1 transition-all duration-300 ease-in-out ${
            isLight
              ? "text-neutral-text-secondary"
              : "text-neutral-text bg-neutral-background-secondary"
          }`}
        >
          <IoMoon size={19} className="transition-colors duration-300" />
        </div>
      </button>
    </div>
  );
}
