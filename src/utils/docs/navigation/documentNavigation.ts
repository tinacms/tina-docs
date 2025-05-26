import siteConfig from "@/content/siteConfig.json";
/**
 * Utilities for managing document navigation structure
 */
import client from "@/tina/__generated__/client";

interface NavItem {
  _template?: string;
  slug?: string;
  items?: NavItem[];
  [key: string]: any;
}

interface NavigationBarData {
  navigationBar: {
    lightModeLogo?: string | null | undefined;
    darkModeLogo?: string | null | undefined;
    supermenuGroup?: any[] | null | undefined;
  };
}

interface FormattedNavigation {
  data: {
    lightModeLogo: string;
    darkModeLogo: string;
    items: any[];
  };
  sha: string;
  fileRelativePath: string;
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
 * Fetches and formats the documentation navigation structure
 *
 * @param preview - Whether to fetch in preview mode
 * @returns Formatted navigation structure with proper slugs
 */
export async function getDocsNavigation(
  preview?: boolean
): Promise<FormattedNavigation> {
  // Fetch navigation data from Tina
  const navigationData = await client.queries.navigationBar({
    relativePath: "DocsNavigationBar.json",
  });

  return formatNavigationData(navigationData.data, preview);
}

/**
 * Processes navigation data into a standardized structure
 *
 * @param navigationData - Raw navigation data from Tina CMS
 * @param preview - Whether in preview mode
 * @returns Formatted navigation data with proper URL structures
 */
export function formatNavigationData(
  navigationData: NavigationBarData,
  preview?: boolean
): FormattedNavigation {
  // Extract the supermenu group data
  const navGroups = navigationData.navigationBar.supermenuGroup || [];

  // Process each navigation group to transform references to URLs
  navGroups.forEach((group: any, index: number, array: any[]) => {
    array[index].items = transformReferencesToSlugs(group.items || []);
  });

  return {
    data: {
      lightModeLogo: navigationData.navigationBar.lightModeLogo || "",
      darkModeLogo:
        navigationData.navigationBar.darkModeLogo ||
        navigationData.navigationBar.lightModeLogo ||
        "",
      items: navGroups,
    },
    sha: "",
    fileRelativePath: "content/navigation-bar/DocsNavigationBar.json",
    preview: !!preview,
  };
}
