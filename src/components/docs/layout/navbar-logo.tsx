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

  // Prevent hydration mismatch by not rendering anything until mounted
  if (!mounted) {
    return null;
  }

  const logo =
    resolvedTheme === "dark"
      ? navigationDocsData[0]?.darkModeLogo ||
        navigationDocsData[0]?.lightModeLogo
      : navigationDocsData[0]?.lightModeLogo;

  return (
    <Link href="/" className="flex items-center">
      <div className="relative md:w-[120px] w-[90px] h-[40px]">
        <Image src={logo} alt="Logo" fill className="object-contain" priority />
      </div>
    </Link>
  );
};
