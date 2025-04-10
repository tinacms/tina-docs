'use client';

import { usePathname } from 'next/navigation';
import React from 'react';
import { FaChevronRight } from 'react-icons/fa';
import { matchActualTarget } from '@/utils/docs/urls';

export interface DocsNavProps {
  navItems: any;
}

// Helper function to extract a URL string from a slug object (or return it if it’s already a string)
function getUrlFromSlug(slug: any): string {
  if (typeof slug === 'string') return slug;
  if (slug && typeof slug === 'object' && slug.id) {
    // Transform the id (e.g. "content/docs/introduction/index.mdx") into a URL (e.g. "/docs/introduction/index")
    return slug.id.replace(/^content\/|\.mdx$/g, '/');
  }
  return '';
}

const getNestedBreadcrumbs = (
  listItems: any[],
  pagePath: string,
  breadcrumbs: any[] = []
) => {
  for (const listItem of listItems || []) {
    // Get the target URL from the slug (or href) property
    const target = listItem.slug || listItem.href;
    const targetUrl = getUrlFromSlug(target);
    if (matchActualTarget(pagePath, targetUrl)) {
      breadcrumbs.push(listItem);
      return [listItem];
    }
    const nestedBreadcrumbs = getNestedBreadcrumbs(listItem.items, pagePath, breadcrumbs);
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
    <ul className="flex items-center flex-wrap gap-1 p-0 m-0 list-none">
      
      {breadcrumbs.map((breadcrumb, i) => {
        const url = getUrlFromSlug(breadcrumb.slug);
        return (
          <li key={url} className="flex items-center m-0">
            {i !== 0 && (
              <FaChevronRight className="text-gray-400 mx-2" aria-hidden="true" />
            )}
            <a
              href={url}
              className="text-sm uppercase text-gray-500 hover:text-orange-500 transition-opacity duration-150"
            >
              {breadcrumb.title || breadcrumb.category}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
