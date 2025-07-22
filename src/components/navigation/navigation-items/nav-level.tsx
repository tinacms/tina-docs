import { DynamicLink } from "@/components/ui/dynamic-link";
import settings from "@/content/settings/config.json";
import { matchActualTarget } from "@/utils/docs/urls";
import { getUrl } from "@/utils/get-url";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";
import React from "react";
import AnimateHeight from "react-animate-height";
import { titleCase } from "title-case";
import { PADDING_LEVELS, TRANSITION_DURATION } from "../constants";
import { NavTitle } from "./nav-title";
import { hasNestedSlug } from "./utils";

interface NavLevelProps {
  navListElem?: React.RefObject<HTMLDivElement | null>;
  categoryData: any;
  level?: number;
  onNavigate?: () => void;
  endpoint_slug?: string | string[];
}

const getEndpointSlug = (endpoint_slug: string | string[] | undefined) => {
  if (!endpoint_slug) return "";
  if (typeof endpoint_slug === "string") {
    return titleCase(endpoint_slug?.replace(/-/g, " "));
  }
  return endpoint_slug.length === 1
    ? titleCase(endpoint_slug[0]?.replace(/-/g, " "))
    : "";
};

export const NavLevel: React.FC<NavLevelProps> = ({
  navListElem,
  categoryData,
  level = 0,
  onNavigate,
  endpoint_slug,
}) => {
  const navLevelElem = React.useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const path = pathname || "";

  // If there is only one endpoint slug, use it as the default title
  // This will be used only when endpoint title is not set
  const defaultTitle = getEndpointSlug(endpoint_slug);
  const slug = getUrl(categoryData.slug).replace(/\/$/, "");
  const [expanded, setExpanded] = React.useState(
    matchActualTarget(slug || getUrl(categoryData.href), path) ||
      hasNestedSlug(categoryData.items, path) ||
      level === 0
  );

  const selected =
    path.split("#")[0] === slug || (slug === "/docs" && path === "/docs/");

  const childSelected = hasNestedSlug(categoryData.items, path);

  if (settings.autoApiTitles && categoryData.verb) {
    categoryData.title = titleCase(categoryData.title);
  }

  const httpMethod = () => (
    <span
      className={`
      inline-flex items-center justify-center px-0.5 py-1 my-1 rounded text-xs font-medium mr-1.5 flex-shrink-0 w-12
      ${
        categoryData.verb === "get"
          ? pathname === slug
            ? "bg-green-100 text-green-800"
            : "bg-green-100/75 group-hover:bg-green-100 text-green-800"
          : ""
      }
      ${
        categoryData.verb === "post"
          ? pathname === slug
            ? "bg-blue-100 text-blue-800"
            : "bg-blue-100/75 group-hover:bg-blue-100 text-blue-800"
          : ""
      }
      ${
        categoryData.verb === "put"
          ? pathname === slug
            ? "bg-yellow-100 text-yellow-800"
            : "bg-yellow-100/75 group-hover:bg-yellow-100 text-yellow-800"
          : ""
      }
      ${
        categoryData.verb === "delete"
          ? pathname === slug
            ? "bg-red-100 text-red-800"
            : "bg-red-100/75 group-hover:bg-red-100 text-red-800"
          : ""
      }
      ${
        categoryData.verb === "patch"
          ? pathname === slug
            ? "bg-purple-100 text-purple-800"
            : "bg-purple-100/75 group-hover:bg-purple-100 text-purple-800"
          : ""
      }
      ${
        !["get", "post", "put", "delete", "patch"].includes(categoryData.verb)
          ? pathname === slug
            ? "bg-gray-100 text-gray-800"
            : "bg-gray-100/75 group-hover:bg-gray-100 text-gray-800"
          : ""
      }
    `}
    >
      {categoryData.verb === "delete" ? "DEL" : categoryData.verb.toUpperCase()}
    </span>
  );

  React.useEffect(() => {
    if (
      navListElem &&
      navLevelElem.current &&
      navListElem.current &&
      selected
    ) {
      const scrollOffset = navListElem.current?.scrollTop || 0;
      const navListOffset =
        navListElem.current?.getBoundingClientRect()?.top || 0;
      const navListHeight = navListElem.current?.offsetHeight || 0;
      const navItemOffset = navLevelElem.current?.getBoundingClientRect()?.top;
      const elementOutOfView =
        navItemOffset - navListOffset > navListHeight + scrollOffset;

      if (elementOutOfView && navLevelElem.current) {
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
        className={`relative flex w-full last:pb-[0.375rem]  ${
          categoryData.status
            ? "after:content-[attr(data-status)] after:text-xs after:font-bold after:bg-[#f9ebe6] after:border after:border-[#edcdc4] after:w-fit after:px-[5px] after:py-[2px] after:rounded-[5px] after:tracking-[0.25px] after:text-[#ec4815] after:mr-[5px] after:ml-[5px] after:leading-none after:align-middle after:h-fit after:self-center"
            : ""
        }`}
        data-status={categoryData.status?.toLowerCase()}
        style={{
          paddingLeft:
            level === 0
              ? PADDING_LEVELS.level0.left
              : PADDING_LEVELS.default.left,
          paddingRight:
            level === 0
              ? PADDING_LEVELS.level0.right
              : PADDING_LEVELS.default.right,
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
        {categoryData.slug ? (
          <DynamicLink
            href={getUrl(categoryData.slug)}
            passHref
            onClick={onNavigate}
            isFullWidth={true}
          >
            <NavTitle level={level} selected={selected && !childSelected}>
              <span className="flex items-center justify-between font-body w-full">
                {categoryData.verb && httpMethod()}
                <span
                  className="flex-1 min-w-0"
                  style={{ overflowWrap: "anywhere" }}
                >
                  {categoryData.slug.title ||
                    categoryData.title ||
                    defaultTitle}
                </span>
                <ChevronRightIcon className="ml-2 flex-shrink-0 opacity-0 w-5 h-auto" />
              </span>
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
            <span className="flex items-center justify-start font-body w-full">
              <span
                className="flex-1 min-w-0"
                style={{ overflowWrap: "anywhere" }}
              >
                {categoryData.title}
              </span>
              {categoryData.items && (
                <ChevronRightIcon
                  className={`ml-2 flex-shrink-0 w-5 h-auto transition-[300ms] ease-out group-hover:rotate-90 ${
                    level < 1
                      ? "text-neutral-text font-bold"
                      : "text-neutral-text-secondary group-hover:text-neutral-text"
                  } ${expanded ? "rotate-90" : ""}`}
                />
              )}
            </span>
          </NavTitle>
        )}
      </div>
      {categoryData.items && (
        <AnimateHeight
          duration={TRANSITION_DURATION}
          height={expanded ? "auto" : 0}
        >
          <div className="relative block">
            {(categoryData.items || []).map((item: any, index: number) => (
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
                  endpoint_slug={endpoint_slug?.[index]}
                />
              </div>
            ))}
          </div>
        </AnimateHeight>
      )}
    </>
  );
};
