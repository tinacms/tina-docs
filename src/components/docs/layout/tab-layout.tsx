"use client";

import * as Tabs from "@radix-ui/react-tabs";
import React from "react";
import { hasNestedSlug } from "../../navigation/navigation-items";
import { Body } from "./body";
import { Sidebar } from "./sidebar";
import { TopNav } from "./TopNav";

export const TabsLayout = ({
  tabs,
  children,
  navigationDocsData,
}: {
  tabs: { label: string; content: any }[];
  children: React.ReactNode;
  navigationDocsData: any;
}) => {
  const [selectedTab, setSelectedTab] = React.useState(tabs[0].label);

  React.useEffect(() => {
    // Find the tab that contains the current path
    const findTabWithPath = (tabs: any[], path: string) => {
      for (const tab of tabs) {
        if (tab.content.items && hasNestedSlug(tab.content.items, path)) {
          return tab.label;
        }
      }
      return tabs[0]?.label;
    };

    const path = window.location.pathname;
    setSelectedTab(findTabWithPath(tabs, path));
  }, [tabs]);

  return (
    <Tabs.Root
      value={selectedTab}
      onValueChange={setSelectedTab}
      className="flex flex-col w-full"
    >
      <TopNav tabs={tabs} navigationDocsData={navigationDocsData} />
      <div className="w-full flex flex-col md:flex-row gap-4 p-4 max-w-[2560px] mx-auto">
        <Sidebar tabs={tabs} />
        <main className="flex-1">
          <Body navigationDocsData={tabs} children={children} />
        </main>
      </div>
    </Tabs.Root>
  );
};
