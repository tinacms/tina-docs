"use client";

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type {
  FormattedNavigation,
  NavItem,
} from "@/utils/docs/navigation/documentNavigation";
import { matchActualTarget } from "@/utils/docs/urls";
import { getUrl } from "@/utils/get-url";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { MdChevronLeft } from "react-icons/md";

const MAX_VISIBLE_CRUMBS = 5;

interface Crumb {
  title: string;
  url?: string;
}

type TrailNode =
  | { kind: "crumb"; crumb: Crumb }
  | { kind: "collapsed"; crumbs: Crumb[] };

const titleOf = (item: NavItem): string => {
  if (item.slug && typeof item.slug === "object" && item.slug.title) {
    return item.slug.title;
  }
  return item.title ?? "Untitled";
};

const firstPageUrl = (items: NavItem[] = []): string | undefined => {
  for (const item of items) {
    if (item.slug) return getUrl(item.slug);
    const nested = firstPageUrl(item.items);
    if (nested) return nested;
  }
  return undefined;
};

const findTrail = (items: NavItem[] | undefined, path: string): Crumb[] => {
  for (const item of items ?? []) {
    if (item.slug && matchActualTarget(getUrl(item.slug), path)) {
      return [{ title: titleOf(item) }];
    }
    const nested = findTrail(item.items, path);
    if (nested.length > 0) {
      return [
        { title: item.title ?? "Untitled", url: firstPageUrl(item.items) },
        ...nested,
      ];
    }
  }
  return [];
};

const buildTrail = (
  navigation: FormattedNavigation | undefined,
  path: string
): Crumb[] => {
  for (const tab of navigation?.data ?? []) {
    for (const group of tab.items ?? []) {
      const trail = findTrail(group.items, path);
      if (trail.length === 0) continue;

      const ancestors: Crumb[] = [];
      if (tab.title) {
        ancestors.push({
          title: tab.title,
          url: firstPageUrl(
            (tab.items ?? []).flatMap((sibling) => sibling.items ?? [])
          ),
        });
      }
      if (group.title) {
        ancestors.push({
          title: group.title,
          url: firstPageUrl(group.items),
        });
      }

      return [...ancestors, ...trail].map((crumb) =>
        crumb.url && matchActualTarget(crumb.url, path)
          ? { title: crumb.title }
          : crumb
      );
    }
  }
  return [];
};

const collapseTrail = (trail: Crumb[]): TrailNode[] => {
  if (trail.length <= MAX_VISIBLE_CRUMBS) {
    return trail.map((crumb): TrailNode => ({ kind: "crumb", crumb }));
  }
  const [root, ...rest] = trail;
  return [
    { kind: "crumb", crumb: root },
    { kind: "collapsed", crumbs: rest.slice(0, -2) },
    ...rest.slice(-2).map((crumb): TrailNode => ({ kind: "crumb", crumb })),
  ];
};

const CollapsedCrumbs = ({ crumbs }: { crumbs: Crumb[] }) => (
  <DropdownMenu>
    <DropdownMenuTrigger
      aria-label="Show hidden breadcrumbs"
      className="flex items-center rounded-sm transition-colors hover:text-brand-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
    >
      <BreadcrumbEllipsis />
    </DropdownMenuTrigger>
    <DropdownMenuContent
      align="start"
      className="z-50 min-w-40 rounded-md border border-neutral-border bg-neutral-surface py-1 text-sm shadow-lg"
    >
      {crumbs.map((crumb) => (
        <DropdownMenuItem
          key={crumb.url ?? crumb.title}
          asChild
          className="cursor-pointer px-3 py-1.5 text-neutral-text-secondary outline-none hover:bg-neutral-background-secondary hover:text-neutral-text"
        >
          <Link href={crumb.url ?? "#"}>{crumb.title}</Link>
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
);

export const BreadCrumbs = ({
  navigationDocsData,
}: {
  navigationDocsData?: FormattedNavigation;
}) => {
  const pathname = usePathname();
  const trail = buildTrail(navigationDocsData, pathname ?? "");
  const backTo = trail
    .slice(0, -1)
    .reverse()
    .find((crumb) => crumb.url);

  if (!backTo) return null;

  const nodes = collapseTrail(trail);

  return (
    <Breadcrumb className="mb-2">
      <div className="sm:hidden">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              href={backTo.url ?? "/docs"}
              className="inline-flex min-w-0 items-center gap-1"
            >
              <MdChevronLeft className="size-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{backTo.title}</span>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </div>

      <div className="hidden sm:block">
        <BreadcrumbList>
          {nodes.map((node, index) => (
            <Fragment key={index}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {node.kind === "collapsed" ? (
                  <CollapsedCrumbs crumbs={node.crumbs} />
                ) : index === nodes.length - 1 ? (
                  <BreadcrumbPage className="truncate">
                    {node.crumb.title}
                  </BreadcrumbPage>
                ) : node.crumb.url ? (
                  <BreadcrumbLink
                    href={node.crumb.url}
                    className="whitespace-nowrap"
                  >
                    {node.crumb.title}
                  </BreadcrumbLink>
                ) : (
                  <span className="whitespace-nowrap">{node.crumb.title}</span>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </div>
    </Breadcrumb>
  );
};
