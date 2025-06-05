import { DynamicLink } from "@/src/components/ui/dynamic-link";
import { getUrl } from "@/src/utils/get-url";
import { matchActualTarget } from "@/utils/docs/urls";
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
