"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface NavbarLogoProps {
  navigationDocsData: any;
}

export const NavbarLogo = ({ navigationDocsData }: NavbarLogoProps) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const lightLogo = navigationDocsData[0]?.lightModeLogo;
  const darkLogo = navigationDocsData[0]?.darkModeLogo || lightLogo;

  return (
    <Link href="/" className="flex items-center">
      <div className="relative md:w-[120px] w-[90px] h-[40px]">
        {mounted ? (
          <>
            <Image
              src={resolvedTheme === "dark" ? darkLogo : lightLogo}
              alt="Logo"
              fill
              className="object-contain"
              priority
              sizes="(max-width: 768px) 90px, 120px"
            />
            {/* Preload the other logo */}
            <Image
              src={resolvedTheme === "dark" ? lightLogo : darkLogo}
              alt=""
              fill
              className="hidden"
              priority
            />
          </>
        ) : (
          <div className="w-full h-full animate-pulse opacity-20" />
        )}
      </div>
    </Link>
  );
};
