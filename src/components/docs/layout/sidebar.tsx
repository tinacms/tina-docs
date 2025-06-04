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
    <div className="sticky hidden brand-glass-gradient lg:block mr-4 h-[calc(100vh-8rem)] w-84 ml-8 top-4 rounded-2xl dark:border dark:border-neutral-border-subtle/60 shadow-xl">
      <div className="relative w-full h-full overflow-hidden">
        <div
          className="absolute inset-0 flex transition-transform duration-300 ease-in-out"
          style={
            isMounted
              ? { transform: `translateX(-${currentIndex * 100}%)` }
              : undefined
          }
        >
          {tabs.map((tab) => (
            <div key={tab.label} className="w-full flex-shrink-0">
              <Tabs.Content value={tab.label}>
                <NavigationSideBar
                  title={tab?.label}
                  tableOfContents={tab?.content}
                />
              </Tabs.Content>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
