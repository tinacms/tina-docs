"use client";

import * as Tabs from "@radix-ui/react-tabs";
import React from "react";
import { Pagination } from "../../ui/pagination";
import { Body } from "./body";
import { Sidebar } from "./sidebar";
import { TopNav } from "./top-nav";
import { findTabWithPath } from "./utils";

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

    const path = window.location.pathname;
    const initialTab = findTabWithPath(tabs, path);
    setSelectedTab(initialTab);
    // Dispatch initial tab change with index
    const initialIndex = tabs.findIndex((tab) => tab.label === initialTab);
    window.dispatchEvent(
      new CustomEvent("tabChange", {
        detail: { value: initialIndex.toString() },
      })
    );
  }, [tabs]);

  const handleTabChange = (value: string) => {
    setSelectedTab(value);
    const newIndex = tabs.findIndex((tab) => tab.label === value);
    window.dispatchEvent(
      new CustomEvent("tabChange", { detail: { value: newIndex.toString() } })
    );
  };

  return (
    <Tabs.Root
      value={selectedTab}
      onValueChange={handleTabChange}
      className="flex flex-col w-full"
    >
      <TopNav tabs={tabs} navigationDocsData={navigationDocsData} />
      <div className="w-full flex flex-col md:flex-row gap-4 md:p-4 max-w-[2560px] mx-auto">
        <Sidebar tabs={tabs} />
        <main className="flex-1">
          <Body navigationDocsData={tabs} children={children} />
          <div className="max-w-6xl">
            <Pagination docsData={navigationDocsData} />
          </div>
        </main>
      </div>
    </Tabs.Root>
  );
};
