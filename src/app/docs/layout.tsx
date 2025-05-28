import { getDocsNavigation } from "@/utils/docs";

import { TabsLayout } from "@/src/components/docs/layout/tab-layout";
import type React from "react";

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch navigation data that will be shared across all docs pages

  const navigationDocsData = await getDocsNavigation();

  const tabs = navigationDocsData.data.map((tab) => ({
    label: tab.title,
    content: tab,
  }));

  return (
    <div className="relative flex flex-col w-full pb-2">
      <TabsLayout
        tabs={tabs}
        children={children}
        navigationDocsData={navigationDocsData}
      />
    </div>
  );
}
