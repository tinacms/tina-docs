"use client";
import { MdArrowDropDown, MdClose } from "react-icons/md";
import { useEffect, useRef, useState } from "react";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { DocsNavigationItems } from "./navigation-items";

export const MobileNavigationWrapper = ({ tocData }: { tocData: any }) => {
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
  }, []);

  return (
    <div ref={containerRef}>
      <NavigationToggle onToggle={toggleDropdown} />
      {isOpen && (
        <NavigationDropdownContent
          tocData={Array.isArray(tocData.items) ? tocData.items : []}
          onClose={closeDropdown}
        />
      )}
    </div>
  );
};

export const NavigationToggle = ({ onToggle }: { onToggle: () => void }) => {
  return (
    <Bars3Icon
      onClick={onToggle}
      className="size-12 mx-5 md:mr-6 md:ml-0 text-brand-secondary-contrast lg:hidden cursor-pointer"
    />
  );
};

export const NavigationDropdownContent = ({
  tocData,
  onClose,
}: {
  tocData: any;
  onClose: () => void;
}) => {
  const [selectedValue, setSelectedValue] = useState("docs");
  const dropdownRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    { value: "docs", label: "Docs" },
    { value: "learn", label: "Learn" },
    { value: "api", label: "API" },
    { value: "logs", label: "Logs" },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !(dropdownRef.current as any).contains(event.target)
      ) {
        // No-op for now
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="animate-fade-down animate-duration-300 fixed top-0 z-20 h-screen w-[75%] overflow-y-auto bg-white p-6 shadow-xl right-0">
      <div className="flex justify-end mb-4">
        <MdClose
          onClick={onClose}
          className="text-3xl text-brand-secondary-contrast cursor-pointer"
        />
      </div>

      <div className="relative w-full mb-4" ref={dropdownRef}>
        <button
          className="w-full p-2 px-4 rounded-md border border-neutral-border focus:outline-none focus:ring-2 focus:ring-brand-primary flex items-center justify-between"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>
            {options.find((opt) => opt.value === selectedValue)?.label}
          </span>
          <MdArrowDropDown
            className={`w-4 h-4 text-brand-secondary-dark-dark transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-border rounded-md shadow-lg">
            {options.map((option) => (
              <button
                key={option.value}
                className={`w-full p-2 px-4 text-left hover:bg-neutral-50 ${
                  selectedValue === option.value ? "bg-neutral-50" : ""
                }`}
                onClick={() => {
                  setSelectedValue(option.value);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedValue === "docs" && <DocsNavigationItems navItems={tocData} />}
    </div>
  );
};
