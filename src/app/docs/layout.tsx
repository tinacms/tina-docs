import { Sidebar } from "@/src/components/SideBar";
import { TopNav } from "@/src/components/TopNav";
import { Breadcrumbs } from "@/src/components/docs/breadcrumbs";
import { getDocsNavigation } from "@/utils/docs";
import * as Tabs from "@radix-ui/react-tabs";
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
    content: {
      items: tab.items.map((group) => ({
        title: group.title || "",
        url: group.items?.[0]?.slug || "",
        items: group.items?.map((item) => ({
          title: item.title || "",
          url: item.slug || "",
        })),
      })),
    },
  }));

  return (
    <div className="relative flex flex-col w-full pb-2">
      <Tabs.Root defaultValue={tabs[0].label} className="flex flex-col w-full">
        <TopNav tabs={tabs} navigationDocsData={navigationDocsData?.data} />
        <div className="w-full flex flex-col md:flex-row gap-4 p-4 max-w-[2560px] mx-auto">
          <Sidebar tabs={tabs} />
          <main className="flex-1">
            <Body
              navigationDocsData={navigationDocsData?.data}
              children={children}
            />
          </main>
        </div>
      </Tabs.Root>
    </div>
  );
}

const Body = ({
  children,
  navigationDocsData,
}: {
  children: React.ReactNode;
  navigationDocsData: any;
}) => {
  return (
    <>
      <Breadcrumbs navItems={navigationDocsData} />
      <div data-pagefind-body id="doc-content">
        {children}
      </div>
    </>
  );
};
