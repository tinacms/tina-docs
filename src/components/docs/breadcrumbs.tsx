"use client";

import { usePathname } from "next/navigation";
import React from "react";

export const BreadCrumbs = ({
  navigationDocsData,
}: {
  navigationDocsData: any;
}) => {
  // Helper function to extract a clean URL path from a slug object
  const getUrlFromSlug = (slug: any): string => {
    if (typeof slug === "string") return slug;
    if (slug && typeof slug === "object" && slug._sys?.relativePath) {
      // Transform relativePath (e.g. "introduction/showcase.mdx") into URL path (e.g. "/docs/introduction/showcase")
      return `/docs/${slug._sys.relativePath.replace(/\.mdx$/, "")}`;
    }
    if (slug && typeof slug === "object" && slug.id) {
      // Transform id (e.g. "content/docs/introduction/showcase.mdx") into URL path
      return slug.id.replace(/^content\//, "/").replace(/\.mdx$/, "");
    }
    return "";
  };

  // Recursive function to search through nested items
  const searchInItems = (items: any[], currentPath: string): string[] => {
    if (!Array.isArray(items) || !currentPath) {
      return [];
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (!item) continue;

      // Check if this item has a slug that matches the current page
      if (item.slug) {
        const itemUrl = getUrlFromSlug(item.slug);

        if (
          itemUrl &&
          (currentPath === itemUrl || currentPath === itemUrl + "/")
        ) {
          const result = [item.slug.title || item.title || "Untitled"];
          return result;
        }
      }

      // If this item has nested items, search recursively
      if (item.items && Array.isArray(item.items)) {
        const nestedResult = searchInItems(item.items, currentPath);
        if (nestedResult.length > 0) {
          const result = [item.title || "Untitled", ...nestedResult];
          // Include this item's title in the breadcrumb trail
          return result;
        }
      }
    }

    return [];
  };

  // Function to find the breadcrumb trail for the current page
  const findBreadcrumbTrail = (
    navigationData: any,
    currentPath: string
  ): string[] => {
    const trail: string[] = [];

    // Defensive checks for invalid data
    if (
      !navigationData ||
      typeof navigationData !== "object" ||
      !Array.isArray(navigationData.items) ||
      !currentPath
    ) {
      return trail;
    }

    // Search through supermenu groups (navigationData.items instead of navigationData.content.items)
    for (let i = 0; i < navigationData.items.length; i++) {
      const supermenuGroup = navigationData.items[i];

      if (
        !supermenuGroup ||
        !supermenuGroup.items ||
        !Array.isArray(supermenuGroup.items)
      ) {
        continue;
      }

      // Check if the current page exists in this supermenu group
      const foundInGroup = searchInItems(supermenuGroup.items, currentPath);

      if (foundInGroup.length > 0) {
        // Add the supermenu group title
        if (supermenuGroup.title) {
          trail.push(supermenuGroup.title);
        }
        // Add any nested group titles and the final page title
        trail.push(...foundInGroup);
        break;
      }
    }

    return trail;
  };

  // Get current pathname using Next.js hook
  const currentPath = usePathname();

  // Get the breadcrumb trail for the current page
  const breadcrumbs = findBreadcrumbTrail(navigationDocsData, currentPath);

  if (navigationDocsData) {
  }

  // Don't render if we don't have valid navigation data or enough breadcrumbs to show
  if (!navigationDocsData || breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center space-x-2 text-sm text-gray-600">
        {breadcrumbs.map((crumb, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <span className="mx-2 text-gray-400" aria-hidden="true">
                ›
              </span>
            )}
            <span
              className={`${
                index === breadcrumbs.length - 1
                  ? "font-medium text-gray-900"
                  : "text-gray-500"
              } uppercase tracking-wide`}
            >
              {crumb}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
};
