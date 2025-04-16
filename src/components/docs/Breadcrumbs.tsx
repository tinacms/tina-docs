"use client";

import { matchActualTarget } from "@/utils/docs/urls";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { FaChevronRight } from "react-icons/fa";

interface NavItemSlug {
  id: string;
}

interface NavItem {
  title?: string;
  category?: string;
  slug?: string | NavItemSlug;
  href?: string;
  items?: NavItem[];
}

export interface DocsNavProps {
  navItems: NavItem[];
}

// Helper function to extract a URL string from a slug object (or return it if it's already a string)
function getUrlFromSlug(slug: string | NavItemSlug | undefined): string {
  if (typeof slug === "string") return slug;
  if (slug && typeof slug === "object" && slug.id) {
    // Transform the id (e.g. "content/docs/introduction/index.mdx") into a URL (e.g. "/docs/introduction/index")
    return slug.id.replace(/^content\/|\.mdx$/g, "/");
  }
  return "";
}

const getNestedBreadcrumbs = (
  listItems: NavItem[],
  pagePath: string,
  breadcrumbs: NavItem[] = [],
): NavItem[] => {
  for (const listItem of listItems || []) {
    // Get the target URL from the slug (or href) property
    const target = listItem.slug || listItem.href;
    const targetUrl = getUrlFromSlug(target);
    if (matchActualTarget(pagePath, targetUrl)) {
      breadcrumbs.push(listItem);
      return [listItem];
    }
    const nestedBreadcrumbs = getNestedBreadcrumbs(
      listItem.items || [],
      pagePath,
      breadcrumbs,
    );
    if (nestedBreadcrumbs.length) {
      return [listItem, ...nestedBreadcrumbs];
    }
  }
  return [];
};

export const Breadcrumbs = ({ navItems }: DocsNavProps) => {
  const pathname = usePathname();

  // Get the breadcrumb items for the current page
  const breadcrumbs = getNestedBreadcrumbs(navItems, pathname);

  return (
    <nav
      className="mb-4 flex items-center text-sm text-gray-500"
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const target = item.href || getUrlFromSlug(item.slug);

          return (
            <li key={target} className="flex items-center">
              {index > 0 && (
                <FaChevronRight
                  className="mx-2 h-3 w-3 text-gray-400"
                  aria-hidden="true"
                />
              )}
              {isLast ? (
                <span className="text-gray-900">{item.title}</span>
              ) : (
                <Link
                  href={target}
                  className="hover:text-gray-700"
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.title}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
