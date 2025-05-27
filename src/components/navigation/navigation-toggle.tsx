import { Bars3Icon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import { MdArrowDropDown, MdClose } from "react-icons/md";
import { DocsNavigationItems } from "./navigation-items";

export const NavigationToggle = ({ onToggle }: { onToggle: () => void }) => {
  return (
    <Bars3Icon
      onClick={onToggle}
      className="size-11 mx-5 md:mr-6 md:ml-0 text-brand-secondary-contrast lg:hidden cursor-pointer"
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
  const [selectedValue, setSelectedValue] = useState(tocData[0].title);
  const dropdownRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  const options = tocData?.map((option: any) => ({
    value: option.title,
    label: option.title,
    content: option.items,
  }));

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
    <div className="animate-fade-down animate-duration-300 fixed top-0 z-20 h-screen w-[75%] overflow-y-auto bg-neutral-background border-l border-neutral-border-subtle p-6 shadow-xl right-0">
      <div className="flex justify-end mb-4">
        <MdClose
          onClick={onClose}
          className="size-11 text-brand-secondary-contrast cursor-pointer"
        />
      </div>

      <div className="relative w-full mb-4" ref={dropdownRef}>
        <button
          type="button"
          className="w-full p-2 px-4 rounded-lg border border-neutral-border focus:outline-none focus:ring-0 focus:ring-none flex items-center justify-between"
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
          <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-border rounded-lg shadow-lg">
            {options.map((option) => (
              <button
                type="button"
                key={option.value}
                className={`w-full p-2 px-4 text-left hover:bg-neutral-50 rounded-0 first:rounded-t-lg last:rounded-b-lg ${
                  selectedValue === option.value
                    ? "bg-neutral-50 text-brand-secondary"
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
      <DocsNavigationItems
        navItems={options.find((opt) => opt.value === selectedValue)?.content}
      />
    </div>
  );
};
