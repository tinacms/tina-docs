import { hasNestedSlug } from "@/components/navigation/navigation-items/utils";

import { hasMatchingApiEndpoint } from "@/components/navigation/navigation-items/utils";

interface Tab {
  label: string;
  content: {
    items: any[];
    __typename?: string;
  };
}

export const findTabWithPath = (tabs: Tab[], path: string) => {
  for (const tab of tabs) {
    if (tab.content?.items && hasNestedSlug(tab.content?.items, path)) {
      return tab.label;
    }

    if (
      tab.content?.__typename === "NavigationBarTabsApiTab" &&
      hasMatchingApiEndpoint(tab.content?.items, path)
    ) {
      return tab.label;
    }
  }
  return tabs[0]?.label;
};
