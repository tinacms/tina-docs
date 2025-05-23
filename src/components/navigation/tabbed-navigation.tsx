import * as Tabs from "@radix-ui/react-tabs";
import React from "react";
import { NavigationSideBar } from "./navigation-sidebar";

interface TabItem {
  id: string;
  label: string;
  content: any; // This will be your navigation data for each tab
}

interface TabbedNavigationProps {
  tabs: TabItem[];
  defaultTab?: string;
}

export const TabbedNavigation: React.FC<TabbedNavigationProps> = ({
  tabs,
  defaultTab = tabs[0]?.id,
}) => {
  return (
    <Tabs.Root className="flex flex-col w-full" defaultValue={defaultTab}>
      <Tabs.List
        className="flex border-b border-gray-200 dark:border-gray-700"
        aria-label="Navigation sections"
      >
        {tabs.map((tab) => (
          <Tabs.Trigger
            key={tab.id}
            value={tab.id}
            className="relative px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200
              data-[state=active]:text-brand-primary
              after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-brand-primary after:scale-x-0 after:transition-transform after:duration-200
              data-[state=active]:after:scale-x-100"
          >
            {tab.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      {tabs.map((tab) => (
        <Tabs.Content
          key={tab.id}
          value={tab.id}
          className="flex-1 data-[state=inactive]:hidden data-[state=active]:animate-fadeIn"
        >
          <NavigationSideBar tableOfContents={tab.content} />
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
};
