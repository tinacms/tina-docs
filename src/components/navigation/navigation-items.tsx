"use client";

import { DynamicLink } from "@/src/components/ui/dynamic-link";
import { getUrl } from "@/src/utils/get-url";
import { matchActualTarget } from "@/utils/docs/urls";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import AnimateHeight from "react-animate-height";
import {
  FONT_SIZES,
  FONT_WEIGHTS,
  PADDING_LEVELS,
  TRANSITION_DURATION,
} from "./constants";
import type { DocsNavProps, NavTitleProps } from "./type";

const NavTitle: React.FC<NavTitleProps> = ({
  children,
  level = 3,
  selected,
  childSelected,
  ...props
}: NavTitleProps) => {
  const baseStyles =
    "group flex cursor-pointer items-center gap-1 pb-0.5 pl-4 leading-tight transition duration-150 ease-out hover:opacity-100";

  const headerLevelClasses = {
    0: `${FONT_WEIGHTS.light} text-brand-primary ${FONT_SIZES.xl} pt-2 opacity-100`,
    1: {
      default: `${FONT_SIZES.base} ${FONT_WEIGHTS.normal} pt-1 text-neutral-text`,
      selected: `${FONT_SIZES.base} ${FONT_WEIGHTS.normal} pt-1 ${FONT_WEIGHTS.bold} text-brand-secondary`,
      childSelected: `${FONT_SIZES.base} ${FONT_WEIGHTS.normal} pt-1 ${FONT_WEIGHTS.medium} text-neutral-text`,
    },
    2: {
      default: `${FONT_SIZES.small} ${FONT_WEIGHTS.normal} opacity-80 pt-0.5 text-neutral-text`,
      selected: `${FONT_SIZES.small} ${FONT_WEIGHTS.normal} pt-0.5 ${FONT_WEIGHTS.bold} text-brand-secondary`,
      childSelected: `${FONT_SIZES.small} ${FONT_WEIGHTS.normal} pt-1 ${FONT_WEIGHTS.medium} text-neutral-text`,
    },
    3: {
      default: `${FONT_SIZES.small} ${FONT_WEIGHTS.normal} opacity-80 pt-0.5 text-neutral-text`,
      selected: `${FONT_SIZES.small} ${FONT_WEIGHTS.normal} pt-0.5 ${FONT_WEIGHTS.bold} text-brand-secondary`,
      childSelected: `${FONT_SIZES.small} ${FONT_WEIGHTS.normal} pt-1 ${FONT_WEIGHTS.medium} text-neutral-text`,
    },
  };

  const headerLevel = level > 3 ? 3 : level;
  const selectedClass = selected
    ? "selected"
    : childSelected
    ? "childSelected"
    : "default";
  const classes =
    level < 1
      ? headerLevelClasses[headerLevel]
      : headerLevelClasses[headerLevel][selectedClass];

  return (
    <div className={`${baseStyles} ${classes}`} {...props}>
      {children}
    </div>
  );
};

export const hasNestedSlug = (navItems: any[], slug: string) => {
  for (const item of Array.isArray(navItems) ? navItems : []) {
    if (matchActualTarget(getUrl(item.slug || item.href), slug)) {
      return true;
    }
    if (item.items) {
      if (hasNestedSlug(item.items, slug)) {
        return true;
      }
    }
  }
  return false;
};

const NavLevel = ({
  navListElem,
  categoryData,
  level = 0,
  onNavigate,
}: {
  navListElem?: any;
  categoryData: any;
  level?: number;
  onNavigate?: () => void;
}) => {
  const navLevelElem = React.useRef(null);
  const pathname = usePathname();
  const path = pathname || "";
  const slug = getUrl(categoryData.slug).replace(/\/$/, "");
  const [expanded, setExpanded] = React.useState(
    matchActualTarget(slug || getUrl(categoryData.href), path) ||
      hasNestedSlug(categoryData.items, path) ||
      level === 0
  );

  const selected =
    path.split("#")[0] === slug || (slug === "/docs" && path === "/docs/");

  const childSelected = hasNestedSlug(categoryData.items, path);

  React.useEffect(() => {
    if (
      navListElem &&
      navLevelElem.current &&
      navListElem.current &&
      selected
    ) {
      const scrollOffset = navListElem.current.scrollTop;
      const navListOffset = navListElem.current.getBoundingClientRect().top;
      const navListHeight = navListElem.current.offsetHeight;
      const navItemOffset = navLevelElem.current.getBoundingClientRect().top;
      const elementOutOfView =
        navItemOffset - navListOffset > navListHeight + scrollOffset;

      if (elementOutOfView) {
        navLevelElem.current.scrollIntoView({
          behavior: "auto",
          block: "center",
          inline: "nearest",
        });
      }
    }
  }, [navListElem, selected]);

  return (
    <>
      <div
        ref={navLevelElem}
        className={`relative flex last:mb-[0.375rem] ${
          categoryData.status
            ? "after:content-[attr(data-status)] after:inline-flex after:text-xs after:font-bold after:bg-[#f9ebe6] after:border after:border-[#edcdc4] after:w-fit after:px-[5px] after:py-[2px] after:rounded-[5px] after:tracking-[0.25px] after:text-[#ec4815] after:mr-[5px] after:ml-[5px] after:leading-none after:align-middle after:h-fit after:self-center"
            : ""
        }`}
        data-status={categoryData.status?.toLowerCase()}
      >
        {categoryData.slug ? (
          <DynamicLink
            href={getUrl(categoryData.slug)}
            passHref
            onClick={onNavigate}
          >
            <NavTitle level={level} selected={selected && !childSelected}>
              <span className="-mr-2 pr-2">{categoryData.title}</span>
            </NavTitle>
          </DynamicLink>
        ) : (
          <NavTitle
            level={level}
            selected={selected && !childSelected}
            childSelected={childSelected}
            onClick={() => {
              setExpanded(!expanded);
            }}
          >
            <span className=" -mr-2 pr-2 font-body">{categoryData.title}</span>
            {categoryData.items && !selected && (
              <ChevronRightIcon
                className={`${
                  level < 1
                    ? "text-brand-primary group-hover:text-brand-primary-hover"
                    : "text-neutral-text group-hover:text-neutral-text-secondary"
                } -my-2 h-auto w-5 transition-[300ms] ease-out group-hover:rotate-90 ${
                  expanded ? "rotate-90" : ""
                }`}
              />
            )}
          </NavTitle>
        )}
      </div>
      {categoryData.items && (
        <>
          <div className="mb-1.5" />
          <AnimateHeight
            duration={TRANSITION_DURATION}
            height={expanded ? "auto" : 0}
          >
            <div
              className="relative block"
              style={{
                paddingLeft:
                  level === 0
                    ? PADDING_LEVELS.level0.left
                    : PADDING_LEVELS.default.left,
                paddingTop:
                  level === 0
                    ? PADDING_LEVELS.level0.top
                    : PADDING_LEVELS.default.top,
                paddingBottom:
                  level === 0
                    ? PADDING_LEVELS.level0.bottom
                    : PADDING_LEVELS.default.bottom,
              }}
            >
              {(categoryData.items || []).map((item) => (
                <div
                  key={`child-container-${
                    item.slug ? getUrl(item.slug) + level : item.title + level
                  }`}
                >
                  <NavLevel
                    navListElem={navListElem}
                    level={level + 1}
                    categoryData={item}
                    onNavigate={onNavigate}
                  />
                </div>
              ))}
            </div>
          </AnimateHeight>
        </>
      )}
    </>
  );
};

export const DocsNavigationItems = ({
  navItems,
  __typename,
  onNavigate,
}: DocsNavProps & { __typename: string } & { onNavigate?: () => void }) => {
  const navListElem = React.useRef(null);

  return (
    <div
      className="overflow-x-hidden py-2 px-0 pb-6 -mr-[1px] scrollbar-thin lg:py-4 lg:pb-8"
      ref={navListElem}
    >
      {navItems?.length > 0 &&
        navItems?.map((categoryData, index) => (
          <div
            key={`mobile-${
              categoryData.slug
                ? getUrl(categoryData.slug)
                : categoryData.title
                ? categoryData.title
                : categoryData.id
                ? categoryData.id
                : `item-${index}`
            }`}
          >
            <NavLevel
              navListElem={navListElem}
              categoryData={categoryData}
              onNavigate={onNavigate}
            />
          </div>
        ))}
    </div>
  );
};

export const getEndpointSlug = (method: string, path: string) => {
  // Match the exact filename generation logic from our API endpoint generator
  const pathSafe = path
    .replace(/^\//, "") // Remove leading slash
    .replace(/\//g, "-") // Replace slashes with dashes
    .replace(/[{}]/g, "") // Remove curly braces
    .replace(/[^\w-]/g, "") // Remove any non-word characters except dashes
    .toLowerCase();

  return `${method.toLowerCase()}-${pathSafe}`;
};

export const getTagSlug = (tag: string) => {
  // Match the exact tag sanitization logic from our API endpoint generator
  return tag
    .replace(/[^\w\s-]/g, "") // Remove special characters except spaces and dashes
    .replace(/\s+/g, "-") // Replace spaces with dashes
    .toLowerCase();
};

export const ApiNavigationItems = ({
  navItems,
  __typename,
  onNavigate,
}: DocsNavProps & { __typename: string } & { onNavigate?: () => void }) => {
  const navListElem = React.useRef(null);
  const pathname = usePathname();
  const currentPath = pathname || "";

  // Separate normal documents from API groups
  const { normalDocs, apiGroups } = React.useMemo(() => {
    if (!navItems?.length) return { normalDocs: [], apiGroups: {} };

    const normalDocs: any[] = [];
    const apiGroups: Record<
      string,
      Array<{
        method: string;
        path: string;
        summary: string;
        operationId?: string;
        schema: string;
      }>
    > = {};

    for (const item of navItems) {
      // Check if this is an API group (has apiGroup property)
      if (item.apiGroup) {
        try {
          const apiGroupData = JSON.parse(item.apiGroup);
          const { tag, endpoints } = apiGroupData;

          if (tag && endpoints) {
            // Initialize the tag if not present
            if (!apiGroups[tag]) {
              apiGroups[tag] = [];
            }

            // Check if endpoints is in new format (array of objects)
            if (
              Array.isArray(endpoints) &&
              endpoints.length > 0 &&
              typeof endpoints[0] === "object" &&
              endpoints[0].method !== undefined
            ) {
              for (const endpoint of endpoints) {
                apiGroups[tag].push({
                  method: endpoint.method || "GET",
                  path: endpoint.path || "",
                  summary: endpoint.summary || "",
                  operationId: endpoint.operationId,
                  schema: apiGroupData.schema || "",
                });
              }
            } else {
              // Legacy format: endpoints are stored as "METHOD:path" strings
              // Use fallback summaries without making API calls
              for (const endpointId of endpoints) {
                const [method, path] = endpointId.split(":");
                apiGroups[tag].push({
                  method: method || "GET",
                  path: path || "",
                  summary: `${method} ${path}`,
                  operationId: endpointId,
                  schema: apiGroupData.schema || "",
                });
              }
            }
          }
        } catch (error) {
          // Continue processing other items
        }
      } else {
        normalDocs.push(item);
      }
    }

    return { normalDocs, apiGroups };
  }, [navItems]);

  // State to manage which tag sections are expanded
  const [expandedTags, setExpandedTags] = React.useState<
    Record<string, boolean>
  >(() => {
    // Initialize all tags as expanded by default
    const initialState: Record<string, boolean> = {};
    for (const tag of Object.keys(apiGroups)) {
      initialState[tag] = true;
    }
    return initialState;
  });

  const toggleTag = (tag: string) => {
    setExpandedTags((prev) => ({
      ...prev,
      [tag]: !prev[tag],
    }));
  };

  return (
    <div
      className="overflow-x-hidden py-2 px-0 pb-6 -mr-[1px] scrollbar-thin 2xl:py-4 2xl:px-4 2xl:pb-8"
      ref={navListElem}
    >
      {/* Render normal documents first */}
      {normalDocs?.length > 0 &&
        normalDocs.map((categoryData, index) => (
          <div
            key={`api-docs-${
              categoryData.slug
                ? getUrl(categoryData.slug)
                : categoryData.title
                ? categoryData.title
                : categoryData.id
                ? categoryData.id
                : `item-${index}`
            }`}
          >
            <NavLevel
              navListElem={navListElem}
              categoryData={categoryData}
              onNavigate={onNavigate}
            />
          </div>
        ))}

      {/* Render API endpoint groups */}
      {Object.keys(apiGroups).length > 0 &&
        Object.entries(apiGroups).map(
          ([tag, endpoints]: [
            string,
            Array<{
              method: string;
              path: string;
              summary: string;
              operationId?: string;
              schema: string;
            }>
          ]) => {
            const isExpanded = expandedTags[tag] ?? true;

            return (
              <div key={tag}>
                {/* Tag Header - Now Clickable */}
                <div className="mb-3">
                  <div
                    className="group flex cursor-pointer items-center gap-1 pb-0.5 pl-4 leading-tight transition duration-150 ease-out hover:opacity-100 text-brand-primary text-xl pt-2 opacity-100 font-light"
                    onClick={() => toggleTag(tag)}
                  >
                    <span className="-mr-2 pr-2">{tag}</span>
                    <ChevronRightIcon
                      className={`text-brand-primary group-hover:text-brand-primary-hover -my-2 h-auto w-5 transition-[300ms] ease-out group-hover:rotate-90 ${
                        isExpanded ? "rotate-90" : ""
                      }`}
                    />
                  </div>
                </div>

                {/* Endpoints List - Now Collapsible */}
                <AnimateHeight
                  duration={TRANSITION_DURATION}
                  height={isExpanded ? "auto" : 0}
                >
                  <div className="space-y-1 pl-4">
                    {endpoints?.map((endpoint, index) => (
                      <Link
                        key={`${endpoint.method}-${endpoint.path}-${index}`}
                        href={`/docs/api-documentation/${getTagSlug(
                          tag
                        )}/${getEndpointSlug(endpoint.method, endpoint.path)}`}
                        onClick={onNavigate}
                        className="group flex items-center px-3 py-2 text-sm rounded-md transition-colors duration-150"
                      >
                        {/* HTTP Method Badge */}
                        <span
                          className={`
                        inline-flex items-center justify-center px-0.5 py-0 rounded text-xs font-medium mr-1.5 mt-0 flex-shrink-0 w-12
                        ${
                          endpoint.method.toLowerCase() === "get"
                            ? "bg-green-100 text-green-800"
                            : ""
                        }
                        ${
                          endpoint.method.toLowerCase() === "post"
                            ? "bg-blue-100 text-blue-800"
                            : ""
                        }
                        ${
                          endpoint.method.toLowerCase() === "put"
                            ? "bg-yellow-100 text-yellow-800"
                            : ""
                        }
                        ${
                          endpoint.method.toLowerCase() === "delete"
                            ? "bg-red-100 text-red-800"
                            : ""
                        }
                        ${
                          endpoint.method.toLowerCase() === "patch"
                            ? "bg-purple-100 text-purple-800"
                            : ""
                        }
                        ${
                          !["get", "post", "put", "delete", "patch"].includes(
                            endpoint.method.toLowerCase()
                          )
                            ? "bg-gray-100 text-gray-800"
                            : ""
                        }
                      `}
                        >
                          {endpoint.method.toLowerCase() === "delete"
                            ? "DEL"
                            : endpoint.method.toUpperCase()}
                        </span>

                        {/* Summary (multi-line allowed) */}
                        <div className="flex-1 min-w-0">
                          <div
                            className={`leading-relaxed first-letter:capitalize font-sans  ${
                              currentPath ===
                              `/docs/api-documentation/${getTagSlug(
                                tag
                              )}/${getEndpointSlug(
                                endpoint.method,
                                endpoint.path
                              )}`
                                ? "text-brand-secondary font-bold"
                                : "text-neutral-text font-normal"
                            }`}
                          >
                            {endpoint.summary}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </AnimateHeight>
              </div>
            );
          }
        )}

      {/* Show message if no content */}
      {normalDocs?.length === 0 && Object.keys(apiGroups).length === 0 && (
        <div className="p-4 text-gray-500 text-sm">No content configured</div>
      )}
    </div>
  );
};
