import * as Tabs from "@radix-ui/react-tabs";
import { NavigationSideBar } from "./navigation/navigation-sidebar";

interface Tab {
  label: string;
  content: {
    items: Array<{
      title: string;
      url: string;
      items?: Array<{
        title: string;
        url: string;
      }>;
    }>;
  };
}

export const Sidebar = ({ tabs }: { tabs: Tab[] }) => {
  return (
    <>
      {tabs.map((tab) => (
        <Tabs.Content key={tab.label} value={tab.label}>
          <aside className="sticky top-4 hidden md:block mr-4 h-[calc(100vh-2rem)] xl:w-84 justify-self-center w-72 ml-8">
            <NavigationSideBar
              title={tab.label}
              tableOfContents={tab.content}
            />
          </aside>
        </Tabs.Content>
      ))}
    </>
  );
};
