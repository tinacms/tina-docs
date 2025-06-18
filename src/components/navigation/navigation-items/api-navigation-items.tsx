import { getUrl } from "@/utils/get-url";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import AnimateHeight from "react-animate-height";
import { TRANSITION_DURATION } from "../constants";
import { NavLevel } from "./nav-level";
import type { ApiEndpoint, DocsNavProps } from "./types";
import { getEndpointSlug, getTagSlug, processApiGroups } from "./utils";

export const ApiNavigationItems: React.FC<
  DocsNavProps & { __typename: string }
> = ({ navItems, __typename, onNavigate }) => {
  const navListElem = React.useRef(null);
  const pathname = usePathname();
  const currentPath = pathname || "";

  // Process API groups from navigation items
  const { normalDocs, apiGroups } = React.useMemo(
    () => processApiGroups(navItems),
    [navItems]
  );

  // State to manage which tag sections are expanded
  const [expandedTags, setExpandedTags] = React.useState<
    Record<string, boolean>
  >(() => {
    const initialState: Record<string, boolean> = {};
    for (const tag of Object.keys(apiGroups || {})) {
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

  // Ensure apiGroups is not undefined and has the correct type
  const safeApiGroups: Record<string, ApiEndpoint[]> = apiGroups || {};

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
      {Object.keys(safeApiGroups).length > 0 &&
        Object.entries(safeApiGroups).map(([tag, endpoints]) => (
          <div key={tag}>
            {/* Tag Header */}
            <div className="mb-3">
              <div
                className="group flex cursor-pointer items-center gap-1 pb-0.5 pl-4 leading-tight transition duration-150 ease-out hover:opacity-100 text-neutral-text text-xl pt-2 opacity-100 font-light"
                onClick={() => toggleTag(tag)}
              >
                <span className="-mr-2 pr-2">{tag}</span>
                <ChevronRightIcon
                  className={`text-neutral-text -my-2 h-auto w-5 transition-[300ms] ease-out group-hover:rotate-90 ${
                    expandedTags[tag] ? "rotate-90" : ""
                  }`}
                />
              </div>
            </div>

            {/* Endpoints List */}
            <AnimateHeight
              duration={TRANSITION_DURATION}
              height={expandedTags[tag] ? "auto" : 0}
            >
              <div className="space-y-1 pl-4">
                {(endpoints || []).map((endpoint, index) => (
                  <Link
                    key={`${endpoint.method}-${endpoint.path}-${index}`}
                    href={`/docs/api-documentation/${getTagSlug(
                      tag
                    )}/${getEndpointSlug(endpoint.method, endpoint.path)}`}
                    onClick={onNavigate}
                    className="group flex items-center pl-2 py-2 text-sm rounded-md transition-colors duration-150"
                  >
                    {/* HTTP Method Badge */}
                    <span
                      className={`
                        inline-flex items-center justify-center px-0.5 py-[3px] rounded text-xs font-medium mr-1.5 mt-0 flex-shrink-0 w-12
                        ${
                          endpoint.method.toLowerCase() === "get"
                            ? currentPath ===
                              `/docs/api-documentation/${getTagSlug(
                                tag
                              )}/${getEndpointSlug(
                                endpoint.method,
                                endpoint.path
                              )}`
                              ? "bg-green-100 text-green-800"
                              : "bg-green-100/75 group-hover:bg-green-100 text-green-800"
                            : ""
                        }
                        ${
                          endpoint.method.toLowerCase() === "post"
                            ? currentPath ===
                              `/docs/api-documentation/${getTagSlug(
                                tag
                              )}/${getEndpointSlug(
                                endpoint.method,
                                endpoint.path
                              )}`
                              ? "bg-blue-100 text-blue-800"
                              : "bg-blue-100/75 group-hover:bg-blue-100 text-blue-800"
                            : ""
                        }
                        ${
                          endpoint.method.toLowerCase() === "put"
                            ? currentPath ===
                              `/docs/api-documentation/${getTagSlug(
                                tag
                              )}/${getEndpointSlug(
                                endpoint.method,
                                endpoint.path
                              )}`
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-yellow-100/75 group-hover:bg-yellow-100 text-yellow-800"
                            : ""
                        }
                        ${
                          endpoint.method.toLowerCase() === "delete"
                            ? currentPath ===
                              `/docs/api-documentation/${getTagSlug(
                                tag
                              )}/${getEndpointSlug(
                                endpoint.method,
                                endpoint.path
                              )}`
                              ? "bg-red-100 text-red-800"
                              : "bg-red-100/75 group-hover:bg-red-100 text-red-800"
                            : ""
                        }
                        ${
                          endpoint.method.toLowerCase() === "patch"
                            ? currentPath ===
                              `/docs/api-documentation/${getTagSlug(
                                tag
                              )}/${getEndpointSlug(
                                endpoint.method,
                                endpoint.path
                              )}`
                              ? "bg-purple-100 text-purple-800"
                              : "bg-purple-100/75 group-hover:bg-purple-100 text-purple-800"
                            : ""
                        }
                        ${
                          !["get", "post", "put", "delete", "patch"].includes(
                            endpoint.method.toLowerCase()
                          )
                            ? currentPath ===
                              `/docs/api-documentation/${getTagSlug(
                                tag
                              )}/${getEndpointSlug(
                                endpoint.method,
                                endpoint.path
                              )}`
                              ? "bg-gray-100 text-gray-800"
                              : "bg-gray-100/75 group-hover:bg-gray-100 text-gray-800"
                            : ""
                        }
                      `}
                    >
                      {endpoint.method.toLowerCase() === "delete"
                        ? "DEL"
                        : endpoint.method.toUpperCase()}
                    </span>

                    {/* Summary */}
                    <div className="flex-1 min-w-0">
                      <div
                        className={`leading-relaxed first-letter:capitalize font-sans ${
                          currentPath ===
                          `/docs/api-documentation/${getTagSlug(
                            tag
                          )}/${getEndpointSlug(endpoint.method, endpoint.path)}`
                            ? "text-brand-primary font-semibold"
                            : "text-neutral-text-secondary group-hover:text-neutral-text font-normal"
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
        ))}

      {/* Show message if no content */}
      {normalDocs?.length === 0 && Object.keys(safeApiGroups).length === 0 && (
        <div className="p-4 text-gray-500 text-sm">No content configured</div>
      )}
    </div>
  );
};
