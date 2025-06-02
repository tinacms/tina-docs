"use client";

import { DynamicLink } from "@/src/components/ui/dynamic-link";
import { getUrl } from "@/src/utils/get-url";
import { matchActualTarget } from "@/utils/docs/urls";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
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
  onNavigate,
}: DocsNavProps & { onNavigate?: () => void }) => {
  const navListElem = React.useRef(null);

  return (
    <div
      className="overflow-x-hidden py-2 px-0 pb-6 -mr-[1px] scrollbar-thin lg:py-4 lg:pb-8"
      ref={navListElem}
    >
      {navItems?.length > 0 &&
        navItems?.map((categoryData) => (
          <div
            key={`mobile-${
              categoryData.slug ? getUrl(categoryData.slug) : categoryData.title
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
