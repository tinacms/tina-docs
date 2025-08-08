"use client";

import { usePathname } from "next/navigation";
import React from "react";
import Link from "next/link";

interface BreadcrumbItem {
  title: string;
  url?: string; 
}

export const BreadCrumbs = ({
  navigationDocsData,
}: {
  navigationDocsData: any;
}) => {
  // Helper function to extract a clean URL path from a slug object
  const getUrlFromSlug = (slug: any): string => {
    if (typeof slug === "string") return slug;
    if (slug && typeof slug === "object" && slug._sys?.relativePath) {
      return `/docs/${slug._sys.relativePath.replace(/\.mdx$/, "")}`;
    }
    if (slug && typeof slug === "object" && slug.id) {
      return slug.id.replace(/^content\//, "/").replace(/\.mdx$/, "");
    }
    return "";
  };

  // Find the first page URL in a list of items (recursively)
  const findFirstPageUrl = (items: any[]): string | null => {
    if (!Array.isArray(items)) return null;

    for (const item of items) {
      // If this item has a slug, it's a page - return its URL
      if (item.slug) {
        return getUrlFromSlug(item.slug);
      }

      // If this item has nested items, search recursively
      if (item.items && Array.isArray(item.items)) {
        const nestedUrl = findFirstPageUrl(item.items);
        if (nestedUrl) return nestedUrl;
      }
    }

    return null;
  };

  // Recursive function to search through nested items and return breadcrumb items
  const searchInItems = (items: any[], currentPath: string): BreadcrumbItem[] => {
    if (!Array.isArray(items) || !currentPath) return [];

    for (const item of items) {
      if (!item) continue;

      // Check if this item has a slug that matches the current page
      if (item.slug) {
        const itemUrl = getUrlFromSlug(item.slug);
        if (itemUrl && (currentPath === itemUrl || currentPath === itemUrl + "/")) {
          // This is the current page - no URL needed
          return [{ title: item.slug.title || item.title || "Untitled" }];
        }
      }

      // If this item has nested items, search recursively
      if (item.items && Array.isArray(item.items)) {
        const nestedResult = searchInItems(item.items, currentPath);
        if (nestedResult.length > 0) {
          // Found the current page in nested items
          // Add this item's title with a link to its first page
          const firstPageUrl = findFirstPageUrl(item.items);
          return [
            { 
              title: item.title || "Untitled", 
              url: firstPageUrl || undefined 
            },
            ...nestedResult
          ];
        }
      }
    }

    return [];
  };

  // Function to find the breadcrumb trail for the current page
  const findBreadcrumbTrail = (
    navigationData: any,
    currentPath: string
  ): BreadcrumbItem[] => {
    const trail: BreadcrumbItem[] = [];

    if (
      !navigationData ||
      typeof navigationData !== "object" ||
      !Array.isArray(navigationData.items) ||
      !currentPath
    ) {
      return trail;
    }

    // Search through supermenu groups
    for (const supermenuGroup of navigationData.items) {
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
        // Add the supermenu group title with link to its first page
        if (supermenuGroup.title) {
          const firstPageUrl = findFirstPageUrl(supermenuGroup.items);
          trail.push({
            title: supermenuGroup.title,
            url: firstPageUrl || undefined
          });
        }
        // Add any nested group titles and the final page title
        trail.push(...foundInGroup);
        break;
      }
    }

    return trail;
  };

  const currentPath = usePathname();
  const breadcrumbs = findBreadcrumbTrail(navigationDocsData, currentPath);

  if (!navigationDocsData || breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="max-w-5xl mx-auto flex items-center space-x-2 text-sm text-brand-primary-light">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const isClickable = !isLast && crumb.url;

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 text-brand-primary" aria-hidden="true">
                  ›
                </span>
              )}
              
              {isClickable ? (
                <Link
                  href={crumb.url!}
                  className="text-sm uppercase text-neutral-text-secondary hover:text-brand-primary transition-all duration-300 cursor-pointer"
                >
                  {crumb.title}
                </Link>
              ) : (
                <span
                  className={`text-sm uppercase tracking-wide ${
                    isLast
                      ? "font-medium text-neutral-text"
                      : "text-neutral-text-secondary"
                  }`}
                >
                  {crumb.title}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};