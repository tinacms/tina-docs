// biome-ignore lint/style/useImportType: <explanation>
import React from "react";
import { FONT_SIZES, FONT_WEIGHTS } from "../constants";
import type { NavTitleProps } from "./types";

export const NavTitle: React.FC<NavTitleProps> = ({
  children,
  level = 3,
  selected,
  childSelected,
  ...props
}: NavTitleProps) => {
  const baseStyles =
    "group flex cursor-pointer items-center py-0.5 leading-tight transition duration-150 ease-out hover:opacity-100 w-full";

  const headerLevelClasses = {
    0: `${FONT_WEIGHTS.light} text-neutral-text ${FONT_SIZES.xl} pt-4 opacity-100`,
    1: {
      default: `${FONT_SIZES.base} ${FONT_WEIGHTS.light} pl-3 pt-1 text-neutral-text-secondary hover:text-neutral-text `,
      selected: `${FONT_SIZES.base} ${FONT_WEIGHTS.semibold} pl-3 pt-1 text-brand-primary `,
      childSelected: `${FONT_SIZES.base} ${FONT_WEIGHTS.normal} pl-3 pt-1  text-neutral-text`,
    },
    2: {
      default: `${FONT_SIZES.small} ${FONT_WEIGHTS.light} pl-6 opacity-80 pt-0.5 text-neutral-text-secondary hover:text-neutral-text `,
      selected: `${FONT_SIZES.small} ${FONT_WEIGHTS.semibold} pl-6 pt-0.5 text-brand-primary `,
      childSelected: `${FONT_SIZES.small} ${FONT_WEIGHTS.normal} pl-6 pt-1  text-neutral-text`,
    },
    3: {
      default: `${FONT_SIZES.small} ${FONT_WEIGHTS.light} pl-9 opacity-80 pt-0.5 text-neutral-text    rounded-lg`,
      selected: `${FONT_SIZES.small} ${FONT_WEIGHTS.semibold} pl-9 pt-0.5  text-brand-primary`,
      childSelected: `${FONT_SIZES.small} ${FONT_WEIGHTS.normal} pl-9 pt-1  text-neutral-text`,
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
