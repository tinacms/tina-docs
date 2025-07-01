import { DynamicLink } from "@/components/ui/dynamic-link";
import { matchActualTarget } from "@/utils/docs/urls";
import { getUrl } from "@/utils/get-url";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";
import React from "react";
import AnimateHeight from "react-animate-height";
import { PADDING_LEVELS, TRANSITION_DURATION } from "../constants";
import { NavTitle } from "./nav-title";
import { hasNestedSlug } from "./utils";

interface NavLevelProps {
  navListElem?: React.RefObject<HTMLDivElement>;
  categoryData: any;
  level?: number;
  onNavigate?: () => void;
}

export const NavLevel: React.FC<NavLevelProps> = ({
  navListElem,
  categoryData,
  level = 0,
  onNavigate,
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
                <span
                  className="flex-1 min-w-0"
                  style={{ overflowWrap: "anywhere" }}
                >
                  {categoryData.title}
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
        <>
          <div className="mb-1.5" />
          <AnimateHeight
            duration={TRANSITION_DURATION}
            height={expanded ? "auto" : 0}
          >
            <div className="relative block">
              {(categoryData.items || []).map((item: any) => (
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
