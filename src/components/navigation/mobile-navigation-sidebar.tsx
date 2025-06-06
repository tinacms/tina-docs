"use client";

import { useEffect, useRef, useState } from "react";
import { NavigationToggle } from "./navigation-toggle";
import { NavigationDropdownContent } from "./navigation-toggle";

export const MobileNavSidebar = ({ tocData }: { tocData: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const toggleDropdown = () => setIsOpen((prev) => !prev);
  const closeDropdown = () => setIsOpen(false);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });

  return (
    <div className="flex items-center" ref={containerRef}>
      <NavigationToggle onToggle={toggleDropdown} />
      {isOpen && (
        <NavigationDropdownContent
          tocData={Array.isArray(tocData) ? tocData : []}
          onClose={closeDropdown}
        />
      )}
    </div>
  );
};
