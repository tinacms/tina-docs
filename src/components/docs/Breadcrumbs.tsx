"use client";

import { matchActualTarget } from "@/utils/docs/urls";
import { usePathname } from "next/navigation";
import React from "react";
import { FaChevronRight } from "react-icons/fa";

export interface DocsNavProps {
  navItems: any;
}

// Helper function to extract a URL string from a slug object (or return it if it’s already a string)
function getUrlFromSlug(slug: any): string {
  if (typeof slug === "string") return slug;
  if (slug && typeof slug === "object" && slug.id) {
    // Transform the id (e.g. "content/docs/introduction/index.mdx") into a URL (e.g. "/docs/introduction/index")
    return slug.id.replace(/^content\/|\.mdx$/g, "/");
  }
  return "";
}

const getNestedBreadcrumbs = (
  listItems: any[],
  pagePath: string,
  breadcrumbs: any[] = [],
) => {
  for (const listItem of Array.isArray(listItems) ? listItems : []) {
    // Get the target URL from the slug (or href) property
    const target = listItem.slug || listItem.href;
    const targetUrl = getUrlFromSlug(target);
    if (matchActualTarget(pagePath, targetUrl)) {
      breadcrumbs.push(listItem);
      return [listItem];
    }
    const nestedBreadcrumbs = getNestedBreadcrumbs(
      listItem.items,
      pagePath,
      breadcrumbs,
    );
    if (nestedBreadcrumbs.length) {
      return [listItem, ...nestedBreadcrumbs];
    }
  }
  return [];
};

export function Breadcrumbs({ navItems }: DocsNavProps) {
  const pathname = usePathname();
  const breadcrumbs = getNestedBreadcrumbs(navItems, pathname) || [];

  return (
    <ul className="m-0 flex list-none flex-wrap items-center gap-1 p-0">
      {breadcrumbs.map((breadcrumb, i) => {
        const url = getUrlFromSlug(breadcrumb.slug);
        return (
          <li key={`breadcrumb-${url}-${i}`} className="m-0 flex items-center">
            {i !== 0 && (
              <FaChevronRight
                className="mx-2 text-gray-400"
                aria-hidden="true"
              />
            )}
            <a
              href={url}
              className="text-sm uppercase text-gray-500 transition-opacity duration-150 hover:text-orange-500"
            >
              {breadcrumb.title || breadcrumb.category}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
