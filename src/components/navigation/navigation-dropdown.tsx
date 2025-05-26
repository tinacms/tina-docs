"use client";
import { MdArrowDropDown } from "react-icons/md";
import { useEffect, useRef, useState } from "react";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { DocsNavigationItems } from "./navigation-items";

export const MobileNavigationWrapper = ({ tocData }: { tocData: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const toggleDropdown = () => setIsOpen((prev) => !prev);
  const closeDropdown = () => setIsOpen(false);

  // Ensure outside click always works
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
  }, []);

  return (
    <div ref={containerRef}>
      <NavigationToggle onToggle={toggleDropdown} />
      {isOpen && (
        <NavigationDropdownContent
          tocData={Array.isArray(tocData.items) ? tocData.items : []}
        />
      )}
    </div>
  );
};

export const NavigationToggle = ({ onToggle }: { onToggle: () => void }) => {
  return (
    <Bars3Icon
      onClick={onToggle}
      className="size-12 mx-5 md:mr-6 md:ml-0 md:size-18 text-brand-primary lg:hidden cursor-pointer"
    />
  );
};

export const NavigationDropdownContent = ({ tocData }) => {
  const [selectedValue, setSelectedValue] = useState("docs");
  const dropdownRef = useRef(null);

  const options = [
    { value: "docs", label: "Docs" },
    { value: "learn", label: "Learn" },
    { value: "api", label: "API" },
    { value: "logs", label: "Logs" },
  ];

  // This handles click outside inside the dropdown itself (if needed later)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !(dropdownRef.current as any).contains(event.target)
      ) {
        // no-op — parent handles closing
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="animate-fade-down animate-duration-300 absolute z-20 mt-4 min-h-[90vh] max-h-[90vh] overflow-y-auto w-[70%] rounded-lg bg-white p-6 shadow-xl right-6">
      <div className="relative w-full mb-4" ref={dropdownRef}>
        <select
          className="w-full p-2 px-4 rounded-md border border-neutral-border focus:outline-none focus:ring-2 focus:ring-brand-primary appearance-none"
          value={selectedValue}
          onChange={(e) => setSelectedValue(e.target.value)}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <MdArrowDropDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-secondary-dark-dark pointer-events-none" />
      </div>
      {selectedValue === "docs" && <DocsNavigationItems navItems={tocData} />}
    </div>
  );
};
