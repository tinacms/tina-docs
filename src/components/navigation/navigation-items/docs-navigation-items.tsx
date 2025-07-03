import { getUrl } from "@/utils/get-url";
import React from "react";
import { NavLevel } from "./nav-level";
import type { DocsNavProps } from "./types";

export const DocsNavigationItems: React.FC<
  DocsNavProps & { __typename: string }
> = ({ navItems, __typename, onNavigate }) => {
  const navListElem = React.useRef(null);

  return (
    <div
      className="overflow-x-hidden px-0 pb-6 -mr-[1px] scrollbar-thin lg:pb-8"
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
