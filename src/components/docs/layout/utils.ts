import { hasNestedSlug } from "../../navigation/navigation-items/utils";

import { hasMatchingApiEndpoint } from "../../navigation/navigation-items/utils";

export const findTabWithPath = (tabs: any[], path: string) => {
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
