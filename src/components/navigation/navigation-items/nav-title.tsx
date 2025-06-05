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
