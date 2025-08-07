import { MobileNavSidebar } from "@/components/navigation/mobile-navigation-sidebar";
import * as Tabs from "@radix-ui/react-tabs";
import Link from "next/link";
import type React from "react";
import { useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { Search } from "../../search-docs/search";
import LightDarkSwitch from "../../ui/light-dark-switch";
import { NavbarLogo } from "./navbar-logo";

export const TopNav = ({
  tabs,
  navigationDocsData,
}: {
  tabs: { label: string; content: any }[];
  navigationDocsData: any;
}) => {
  const ctaButtons = navigationDocsData.ctaButtons;
  const hasButtons = ctaButtons && (ctaButtons.button1 || ctaButtons.button2);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getButtonClasses = (variant: string | undefined) => {
    switch (variant) {
      case "primary-background":
        return "bg-brand-primary text-neutral-surface hover:bg-brand-primary-hover";
      case "secondary-background":
        return "bg-brand-secondary text-neutral-text hover:bg-brand-secondary-hover";
      case "primary-outline":
        return "border border-brand-primary text-brand-primary hover:bg-brand-primary/10";
      case "secondary-outline":
        return "border border-brand-secondary text-brand-secondary hover:bg-brand-secondary/10";
      default:
        return "bg-brand-primary text-neutral-surface hover:bg-brand-primary-hover";
    }
  };

  return (
    <div className="border border-neutral-border/50 mb-2 md:mb-4 w-full lg:px-8 py-1 dark:bg-glass-gradient-end dark:border-b dark:border-neutral-border-subtle/60 shadow-md/5">
      <div className="max-w-[2560px] mx-auto flex items-center justify-between lg:py-0 py-2">
        <div className="flex">
          <NavbarLogo navigationDocsData={[navigationDocsData]} />
          <Tabs.List className="lg:flex hidden">
            {tabs.map((tab) => (
              <Tabs.Trigger
                key={tab.label}
                value={tab.label}
                className="px-1 text-lg relative text-brand-primary-contrast mx-4 focus:text-brand-secondary-hover cursor-pointer font-semibold data-[state=active]:text-brand-primary-text after:content-[''] after:absolute after:bottom-1.5 after:left-0 after:h-0.25 after:bg-brand-primary-text after:transition-all after:duration-300 after:ease-out data-[state=active]:after:w-full after:w-0"
              >
                {tab.label || "Untitled Tab"}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </div>
        <div className="flex-1 flex justify-center">
          <Search />
        </div>
        <div className="flex items-center gap-4">
          {hasButtons && (
            <>
              <div className="hidden lg:flex gap-2">
                {ctaButtons.button1?.label && ctaButtons.button1?.link && (
                  <Link
                    href={ctaButtons.button1.link}
                    target="_blank"
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${getButtonClasses(
                      ctaButtons.button1.variant
                    )}`}
                  >
                    {ctaButtons.button1.label}
                  </Link>
                )}
                {ctaButtons.button2?.label && ctaButtons.button2?.link && (
                  <Link
                    href={ctaButtons.button2.link}
                    target="_blank"
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${getButtonClasses(
                      ctaButtons.button2.variant
                    )}`}
                  >
                    {ctaButtons.button2.label}
                  </Link>
                )}
              </div>
              <div className="lg:hidden relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="p-2 hover:bg-neutral-background-secondary rounded-md"
                  type="button"
                >
                  <BsThreeDotsVertical className="size-5 text-brand-secondary-contrast" />
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-neutral-background border border-neutral-border-subtle z-10">
                    <div className="py-1">
                      {ctaButtons.button1?.label &&
                        ctaButtons.button1?.link && (
                          <Link
                            href={ctaButtons.button1.link}
                            className="block px-4 py-2 text-sm text-neutral-text hover:bg-neutral-background-secondary"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            {ctaButtons.button1.label}
                          </Link>
                        )}
                      {ctaButtons.button2?.label &&
                        ctaButtons.button2?.link && (
                          <Link
                            href={ctaButtons.button2.link}
                            className="block px-4 py-2 text-sm text-neutral-text hover:bg-neutral-background-secondary"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            {ctaButtons.button2.label}
                          </Link>
                        )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          <MobileNavSidebar tocData={tabs} />
          <div className="w-full hidden lg:flex justify-end">
            <LightDarkSwitch />
          </div>
        </div>
      </div>
    </div>
  );
};
