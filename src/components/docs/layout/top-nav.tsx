import TinaLamaIcon from "@/src/components/icons/tina-icon.svg";
import { Search } from "@/src/components/search-docs/search";
import LightDarkSwitch from "@/src/components/ui/light-dark-switch";
import * as Tabs from "@radix-ui/react-tabs";
import Link from "next/link";
import { MobileNavigationWrapper } from "../../navigation/navigation-dropdown";

export const TopNav = ({
  tabs,
  navigationDocsData,
}: {
  tabs: { label: string; content: any }[];
  navigationDocsData: any;
}) => {
  return (
    <div className="mb-2 md:mb-4 w-full px-8 py-1 dark:bg-glass-gradient-end dark:border-b dark:border-neutral-border-subtle/60 shadow-md">
      <div className="max-w-[2560px] mx-auto flex items-center justify-between md:justify-start md:py-0 py-2">
        <Link href="/" className="text-xl">
          <TinaLamaIcon className="h-14 w-auto fill-orange-600 mx-5" />
        </Link>
        <Tabs.List className="lg:flex hidden">
          {tabs.map((tab) => (
            <Tabs.Trigger
              key={tab.label}
              value={tab.label}
              className=" px-1 text-lg relative text-brand-secondary-contrast mx-4 focus:text-brand-secondary-hover cursor-pointer font-semibold data-[state=active]:text-brand-secondary-text after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-0.25 after:bg-brand-secondary-text after:transition-all after:duration-300 after:ease-out data-[state=active]:after:w-full after:w-0"
            >
              {tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        <div className="w-full hidden md:flex justify-end mr-6">
          <LightDarkSwitch />
        </div>
        <Search />
        <MobileNavigationWrapper tocData={navigationDocsData} />
      </div>
    </div>
  );
};
