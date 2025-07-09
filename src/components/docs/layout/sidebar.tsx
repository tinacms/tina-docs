"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { useEffect, useState } from "react";
import { NavigationSideBar } from "../../navigation/navigation-sidebar";

export const Sidebar = ({
  tabs,
}: {
  tabs: { label: string; content: any }[];
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const handleTabChange = (e: CustomEvent) => {
      const newValue = e.detail.value;
      setCurrentIndex(Number.parseInt(newValue));
    };

    window.addEventListener("tabChange" as any, handleTabChange);
    return () => {
      window.removeEventListener("tabChange" as any, handleTabChange);
    };
  }, []);

  return (
    <div className="border border-neutral-border/50 sticky hidden brand-glass-gradient lg:block mr-4 min-h-[calc(100vh-8rem)] h-fit w-80 p-4 ml-8 top-4 rounded-2xl dark:border dark:border-neutral-border-subtle/30 shadow-xl flex-shrink-0">
      <div className="relative w-full overflow-x-hidden">
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={
            isMounted
              ? { transform: `translateX(-${currentIndex * 100}%)` }
              : undefined
          }
        >
          {tabs.map((tab) => (
            <div key={tab.label} className="w-full flex-shrink-0">
              <Tabs.Content value={tab.label}>
                <NavigationSideBar tableOfContents={tab?.content} />
              </Tabs.Content>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
