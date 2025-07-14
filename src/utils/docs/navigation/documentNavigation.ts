import siteConfig from "@/content/siteConfig.json";
import client from "@/tina/__generated__/client";

/**
 * A single navigation item
 */
export interface NavItem {
  _template?: string;
  slug?: string;
  title?: string;
  items?: NavItem[];
  [key: string]: unknown;
}

/**
 * A group of navigation items (i.e., supermenu)
 */
export interface SupermenuGroup {
  title?: string;
  items?: NavItem[];
  [key: string]: unknown;
}

/**
 * A tab in the navigation bar
 */
export interface Tab {
  title?: string | null;
  __typename?: string | null;
  supermenuGroup?: SupermenuGroup[] | null;
}

/**
 * Raw structure of navigation data returned by TinaCMS
 */
export interface NavigationBarData {
  navigationBar: {
    lightModeLogo?: string | null | undefined;
    darkModeLogo?: string | null | undefined;
    tabs: Tab[];
    ctaButtons?:
      | {
          button1?:
            | {
                label?: string | null | undefined;
                link?: string | null | undefined;
                variant?: string | null | undefined;
              }
            | null
            | undefined;
          button2?:
            | {
                label?: string | null | undefined;
                link?: string | null | undefined;
                variant?: string | null | undefined;
              }
            | null
            | undefined;
        }
      | null
      | undefined;
  };
}

/**
 * Final formatted structure returned by our utility
 */
export interface FormattedNavigation {
  lightModeLogo?: string | null | undefined;
  darkModeLogo?: string | null | undefined;
  ctaButtons?:
    | {
        button1?:
          | {
              label?: string | null | undefined;
              link?: string | null | undefined;
              variant?: string | null | undefined;
            }
          | null
          | undefined;
        button2?:
          | {
              label?: string | null | undefined;
              link?: string | null | undefined;
              variant?: string | null | undefined;
            }
          | null
          | undefined;
      }
    | null
    | undefined;
  data: {
    title: string;
    __typename: string;
    items: SupermenuGroup[];
  }[];
  sha: string;
  preview: boolean;
}

/**
 * Transforms document references into proper URL slugs
 *
 * @param navItems - Array of navigation items to process
 * @returns Processed navigation items with transformed slugs
 */
const transformReferencesToSlugs = (navItems: NavItem[]): NavItem[] => {
  navItems.forEach((item, index, array) => {
    if (item._template) {
      if (item._template === "items") {
        array[index].items = transformReferencesToSlugs(item.items || []);
      } else {
        // Handle the docs homepage case as a special case with no slug
        // Otherwise reformat the path from content reference to URL path
        array[index].slug =
          array[index].slug === `content${siteConfig.docsHomepage}.mdx`
            ? "/docs"
            : item.slug?.replace(/^content\/|\.mdx$/g, "/") || "";
      }
    }
  });
  return navItems;
};

/**
 * Processes navigation data into a standardized structure
 *
 * @param navigationData - Raw navigation data from Tina CMS
 * @param preview - Whether in preview mode
 * @returns Formatted navigation data with proper URL structures
 */
export const formatNavigationData = (
  navigationData: NavigationBarData,
  preview = false
): FormattedNavigation => {
  const tabs = navigationData.navigationBar.tabs || [];
  const lightModeLogo = navigationData.navigationBar?.lightModeLogo || "";
  const darkModeLogo = navigationData.navigationBar?.darkModeLogo || "";
  const ctaButtons = navigationData.navigationBar?.ctaButtons;

  const tabsData = tabs.map((tab) => {
    const groups = (tab.supermenuGroup || []).map((group) => ({
      ...group,
      items: transformReferencesToSlugs(group.items || []),
    }));

    return {
      title: tab.title || "",
      __typename: tab.__typename || "",
      items: groups,
      lightModeLogo: lightModeLogo,
      darkModeLogo: darkModeLogo,
    };
  });

  return {
    data: tabsData,
    sha: "",
    preview,
    ctaButtons,
    lightModeLogo,
    darkModeLogo,
  };
};
