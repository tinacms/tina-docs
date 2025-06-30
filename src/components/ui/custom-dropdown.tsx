import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import React, { useState } from "react";
import type { ReactNode } from "react";
import { MdArrowDropDown } from "react-icons/md";

export interface DropdownOption {
  value: string;
  label: ReactNode;
}

interface CustomDropdownProps {
  /** The currently selected value */
  value: string;
  /** Function fired when a new option is selected */
  onChange: (value: string) => void;
  /** List of options to choose from */
  options: DropdownOption[];
  /** Placeholder text shown when no option is selected */
  placeholder?: string;
  /** Whether the dropdown is disabled */
  disabled?: boolean;
  /** Additional classes for the trigger button */
  className?: string;
  /** Additional classes for the dropdown content */
  contentClassName?: string;
  /** Additional classes for each menu item */
  itemClassName?: string;
}

/**
 * A reusable dropdown component built with Radix UI.
 *
 * It matches the full width of its trigger and automatically rotates the chevron icon when open.
 */
export const CustomDropdown = ({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  disabled = false,
  className = "",
  contentClassName = "",
  itemClassName = "",
}: CustomDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Find the label for the current value.
  const activeOption = options.find((opt) => opt.value === value);

  return (
    <DropdownMenu onOpenChange={setIsOpen} open={disabled ? false : isOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={`w-full p-2 border border-gray-300 rounded-md shadow-sm text-neutral hover:bg-neutral-background-secondary focus:outline-none flex items-center justify-between gap-2 max-w-full overflow-x-hidden ${
            disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
          } ${className}`}
        >
          <span className="truncate break-words whitespace-normal max-w-full text-left">
            {activeOption ? activeOption.label : placeholder}
          </span>
          <MdArrowDropDown
            className={`w-5 h-5 transition-transform duration-200 ${
              isOpen ? "rotate-180" : "rotate-0"
            } ${disabled ? "opacity-50" : ""}`}
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className={`z-50 max-h-60 overflow-y-auto w-[var(--radix-dropdown-menu-trigger-width)] min-w-[200px] bg-white border border-gray-200 rounded-md shadow-lg ${contentClassName}`}
      >
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-3 py-2 cursor-pointer truncate break-words whitespace-normal max-w-full w-full focus:outline-none focus:ring-0 hover:bg-gray-100 ${itemClassName}`}
          >
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
