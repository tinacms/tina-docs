"use client";

import * as Tabs from "@radix-ui/react-tabs";
import React from "react";
import {
  getEndpointSlug,
  getTagSlug,
  hasNestedSlug,
} from "../../navigation/navigation-items";
import { Body } from "./body";
import { Sidebar } from "./sidebar";
import { TopNav } from "./top-nav";

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
        if (tab.content.__typename === "NavigationBarTabsApiTab") {
          // Check if any endpoint in this tab matches the current path
          const hasMatchingEndpoint = tab.content.items?.some((item: any) => {
            if (item.apiGroup) {
              try {
                const apiGroupData = JSON.parse(item.apiGroup);
                const { tag, endpoints } = apiGroupData;
                if (tag && endpoints) {
                  return endpoints.some((endpoint: any) => {
                    const method =
                      endpoint.method ||
                      (typeof endpoint === "string"
                        ? endpoint.split(":")[0]
                        : "GET");
                    const endpointPath =
                      endpoint.path ||
                      (typeof endpoint === "string"
                        ? endpoint.split(":")[1]
                        : "");
                    return (
                      path ===
                      `/docs/api-documentation/${getTagSlug(
                        tag
                      )}/${getEndpointSlug(method, endpointPath)}`
                    );
                  });
                }
              } catch (error) {
                return false;
              }
            }
            return false;
          });
          if (hasMatchingEndpoint) {
            return tab.label;
          }
        }
      }
      return tabs[0]?.label;
    };

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
      <div className="w-full flex flex-col md:flex-row gap-4 p-4 max-w-[2560px] mx-auto">
        <Sidebar tabs={tabs} />
        <main className="flex-1">
          <Body navigationDocsData={tabs} children={children} />
        </main>
      </div>
    </Tabs.Root>
  );
};
