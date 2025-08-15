"use client";

import { formatNavigationData } from "@/src/utils/docs/navigation/documentNavigation";
import type { NavigationBarData } from "@/src/utils/docs/navigation/documentNavigation";
import * as Tabs from "@radix-ui/react-tabs";
import { usePathname } from "next/navigation";
import React from "react";
import { Body } from "./body";
import { NavigationProvider } from "./navigation-context";
import { Sidebar } from "./sidebar";
import { TopNav } from "./top-nav";
import { findTabWithPath } from "./utils";

export const TabsLayout = ({
  props: { children },
  tinaProps,
}: {
  props: {
    children: React.ReactNode;
  };
  tinaProps: any;
}) => {
  const [navigationDocsData, setNavigationDocsData] = React.useState({});
  const [tabs, setTabs] = React.useState([]);
  const [selectedTab, setSelectedTab] = React.useState();
  const [objectOfSelectedTab, setObjectOfSelectedTab] = React.useState();
  const pathname = usePathname();

  React.useEffect(() => {
    const formattedNavData = formatNavigationData(
      tinaProps.data as NavigationBarData,
      false
    );
    setNavigationDocsData(formattedNavData);
    const tabs = formattedNavData.data.map((tab) => ({
      label: tab.title,
      content: tab,
      __typename: tab.__typename,
    }));
    setTabs(tabs);
    setSelectedTab(tabs[0]);
    setObjectOfSelectedTab(tabs[0]);
  }, [tinaProps.data]);

  React.useEffect(() => {
    // Find the tab that contains the current path
    if (!tabs.length || !pathname) return;

    const initialTab = findTabWithPath(tabs, pathname);
    setSelectedTab(initialTab);
    // Dispatch initial tab change with index
    const initialIndex = tabs.findIndex((tab) => tab.label === initialTab);
    window.dispatchEvent(
      new CustomEvent("tabChange", {
        detail: { value: initialIndex.toString() },
      })
    );
  }, [tabs, pathname]);

  const handleTabChange = (value: string) => {
    setSelectedTab(value);
    setObjectOfSelectedTab(value);
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
      <NavigationProvider navigationData={navigationDocsData}>
        <div className="w-full flex flex-col md:flex-row gap-4 md:p-4 max-w-[2560px] mx-auto">
          <Sidebar tabs={tabs} />
          <main className="flex-1">
            <Body
              navigationDocsData={objectOfSelectedTab?.content}
              children={children}
            />
          </main>
        </div>
      </NavigationProvider>
    </Tabs.Root>
  );
};
