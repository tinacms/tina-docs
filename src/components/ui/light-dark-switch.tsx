"use client";
import { useTheme } from "next-themes";
import { IoMoon, IoSunny } from "react-icons/io5";

export default function LightDarkSwitch() {
  const { theme, setTheme } = useTheme();
  const isLight = theme === "light";

  return (
    <div className="brand-glass-gradient w-fit rounded-full p-1 shadow-xl">
      <button
        type="button"
        className="flex items-center gap-4 cursor-pointer"
        onClick={() => setTheme(isLight ? "dark" : "light")}
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
