import Link from "next/link";
import Image from "next/image";
import { ThemeSelector } from "@/components/ui/theme-selector";

export const DocsFooter = () => {
  return (
    <footer className="w-full py-8 mt-16 border-t border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center max-w-[2560px] mx-auto px-4">
        {/* Left: Empty space for balance */}
        <div className="flex-1" />
        
        {/* Center: Powered by TinaCMS */}
        <div className="flex justify-center items-center flex-1">
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
        </div>
        
        {/* Right: Theme Selector */}
        <div className="flex-1 flex justify-end">
          <div className="relative">
            {(process.env.NODE_ENV === "development" ||
              process.env.NEXT_PUBLIC_ENABLE_THEME_SELECTION === "true") && (
              <ThemeSelector />
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
