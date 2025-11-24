import { ThemeSelector } from "@/components/ui/theme-selector";
import Image from "next/image";
import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="w-full py-8 mt-16 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-[2560px] mx-auto px-4 flex items-center justify-center relative">
        <Link
          href="https://tina.io/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <Image
            src="/svg/tina-icon-orange.svg"
            alt="Tina Logo"
            width={48}
            height={48}
            className="w-12 h-12"
          />
          <span className="text-base font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            Powered by TinaCMS
          </span>
        </Link>
        <div className="absolute right-4">
          {(process.env.NODE_ENV === "development" ||
            process.env.NEXT_PUBLIC_ENABLE_THEME_SELECTION === "true") && (
            <ThemeSelector />
          )}
        </div>
      </div>
    </footer>
  );
};
