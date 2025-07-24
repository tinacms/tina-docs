import { getUrl } from "@/utils/get-url";
import React from "react";
import { titleCase } from "title-case";
import { NavLevel } from "./nav-level";
import type { ApiEndpoint, DocsNavProps } from "./types";
import { getEndpointSlug, getTagSlug, processApiGroups } from "./utils";

export const ApiNavigationItems: React.FC<
  DocsNavProps & { __typename: string }
> = ({ navItems, __typename, onNavigate }) => {
  const navListElem = React.useRef(null);

  // Process API groups from navigation items
  const { normalDocs, apiGroups } = React.useMemo(
    () => processApiGroups(navItems),
    [navItems]
  );

  // Ensure apiGroups is not undefined and has the correct type
  const safeApiGroups: Record<string, ApiEndpoint[]> = apiGroups || {};
  const processedApiGroups = React.useMemo(() => {
    return Object.entries(safeApiGroups).map(([tag, endpoints]) => {
      return {
        title: titleCase(tag),
        items: (endpoints || []).map((endpoint) => ({
          title: endpoint.summary,
          slug: `/docs/api-documentation/${getTagSlug(tag)}/${getEndpointSlug(
            endpoint.method,
            endpoint.path
          )}`,
          verb: endpoint.method.toLowerCase(),
          endpoint_slug: getEndpointSlug(endpoint.method, endpoint.path),
        })),
      };
    });
  }, [safeApiGroups]);

  return (
    <div
      className="overflow-x-hidden px-0 pb-6 -mr-[1px] scrollbar-thin lg:pb-8"
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
              endpoint_slug={categoryData.items?.map(
                (item: any) => item.endpoint_slug
              )}
            />
          </div>
        ))}

      {/* Render API endpoint groups */}
      {processedApiGroups.map((categoryData, index) => (
        <div key={`api-group-${categoryData.title}-${index}`}>
          <NavLevel
            navListElem={navListElem}
            categoryData={categoryData}
            onNavigate={onNavigate}
            endpoint_slug={categoryData.items?.map(
              (item: any) => item.endpoint_slug
            )}
          />
        </div>
      ))}

      {/* Show message if no content */}
      {normalDocs?.length === 0 && processedApiGroups.length === 0 && (
        <div className="p-4 text-gray-500 text-sm">No content configured</div>
      )}
    </div>
  );
};
