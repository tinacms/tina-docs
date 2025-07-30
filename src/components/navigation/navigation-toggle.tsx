import { Bars3Icon } from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MdArrowDropDown, MdClose } from "react-icons/md";
import { findTabWithPath } from "../docs/layout/utils";
import {
  ApiNavigationItems,
  DocsNavigationItems,
} from "./navigation-items/index";

export const NavigationToggle = ({ onToggle }: { onToggle: () => void }) => {
  return (
    <Bars3Icon
      onClick={onToggle}
      className="size-9 flex items-center justify-center mx-5 md:mr-6 md:ml-0 text-brand-secondary-contrast lg:hidden cursor-pointer"
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
  const pathname = usePathname();
  const path = pathname || "";

  const [selectedValue, setSelectedValue] = useState(
    findTabWithPath(tocData, path)
  );
  const dropdownRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  const options = tocData?.map((option: any) => ({
    value: option.label,
    label: option.label,
    content: option.content.items,
    __typename: option.__typename,
  }));

  // Update selected value when pathname changes
  useEffect(() => {
    const newSelectedValue = findTabWithPath(tocData, path);
    setSelectedValue(newSelectedValue);
  }, [path, tocData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !(dropdownRef.current as any).contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[rgba(0,0,0,0.4)] z-10 lg:hidden"
      />

      <div className="max-w-96 fixed top-0 right-0 z-20 h-screen w-[75%] overflow-y-auto bg-neutral-background border-l border-neutral-border-subtle p-6 shadow-xl lg:hidden">
        <div className="flex justify-end mb-4">
          <MdClose
            onClick={onClose}
            className="size-11 text-brand-secondary-contrast cursor-pointer"
          />
        </div>

        <div className="relative w-full mb-4" ref={dropdownRef}>
          <button
            type="button"
            className="w-full p-2 px-4 rounded-lg bg-neutral-background-primary border border-neutral-border-subtle flex items-center justify-between focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span>
              {options.find((opt) => opt.value === selectedValue)?.label}
            </span>
            <MdArrowDropDown
              className={`size-6 text-brand-secondary-dark-dark transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isOpen && (
            <div className="absolute z-30 w-full mt-1 bg-neutral-background border border-neutral-border-subtle rounded-lg shadow-lg">
              {options.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  className={`w-full p-2 px-4 text-left  first:rounded-t-lg last:rounded-b-lg ${
                    selectedValue === option.value
                      ? "bg-neutral-background-secondary text-brand-secondary"
                      : ""
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

        <div className="h-[calc(100vh-250px)] overflow-y-auto px-4 pb-4">
          {options.find((opt) => opt.value === selectedValue)?.__typename ===
          "NavigationBarTabsApiTab" ? (
            <ApiNavigationItems
              navItems={
                options.find((opt) => opt.value === selectedValue)?.content ||
                []
              }
              __typename={
                options.find((opt) => opt.value === selectedValue)
                  ?.__typename || ""
              }
              onNavigate={onClose}
            />
          ) : (
            <DocsNavigationItems
              navItems={
                options.find((opt) => opt.value === selectedValue)?.content ||
                []
              }
              __typename={
                options.find((opt) => opt.value === selectedValue)
                  ?.__typename || ""
              }
              onNavigate={onClose}
            />
          )}
        </div>
      </div>
    </>
  );
};
