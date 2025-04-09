import Link from "next/link";
import React from "react";
import { cn } from "../../utils/cn";

interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  color?: "white" | "blue" | "orange" | "seafoam" | "ghost" | "ghostBlue";
  size?: "large" | "small" | "medium" | "extraSmall";
  className?: string;
  href?: string;
  type?: "button" | "submit" | "reset";
  children: React.ReactNode | React.ReactNode[];
  disabled?: boolean;
}

const baseClasses =
  "transition duration-150 ease-out rounded-full flex items-center font-tuner whitespace-nowrap leading-snug focus:outline-none focus:shadow-outline hover:-translate-y-px active:translate-y-px hover:-translate-x-px active:translate-x-px leading-tight";

const raisedButtonClasses = "hover:shadow active:shadow-none";

const colorClasses = {
  seafoam:
    raisedButtonClasses +
    " text-primary-end hover:text-primary-via border border-seafoam-150 bg-gradient-to-br from-seafoam-50 to-seafoam-150",
  blue:
    raisedButtonClasses +
    " text-white hover:text-gray-50 border border-secondary-start bg-gradient-to-br from-secondary-start via-secondary-via to-secondary-end",
  orange:
    raisedButtonClasses +
    " text-white hover:text-gray-50 border border-primary-end bg-gradient-to-br from-primary-start via-primary-via to-primary-end",
  white:
    raisedButtonClasses +
    " text-primary-via hover:text-primary-start border border-gray-100/60 bg-gradient-to-br from-white to-gray-50",
  ghost:
    "text-primary-via hover:text-primary-start",
  orangeWithBorder:
    "text-primary-via hover:text-primary-start border border-primary-via bg-white",
  ghostBlue:
    "text-secondary-end hover:text-secondary-via",
};

const sizeClasses = {
  large: "px-8 pt-[14px] pb-[12px] text-lg font-medium",
  medium: "px-6 pt-[12px] pb-[10px] text-base font-medium",
  small: "px-5 pt-[10px] pb-[8px] text-sm font-medium",
  extraSmall: "px-4 pt-[8px] pb-[6px] text-xs font-medium",
};

export const Button = ({
  color = "seafoam",
  size = "medium",
  className = "",
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cn(
        baseClasses,
        color === "white"
          ? "text-primary-end hover:text-primary-via border border-seafoam-150 bg-gradient-to-br from-seafoam-50 to-seafoam-150"
          : color === "blue"
          ? "text-primary-via hover:text-primary-start border border-gray-100/60 bg-gradient-to-br from-white to-gray-50"
          : color === "ghost"
          ? "text-primary-via hover:text-primary-start"
          : color === "ghostBlue"
          ? "text-primary-via hover:text-primary-start border border-primary-via bg-white"
          : ""
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export const LinkButton = ({
  link = "/",
  color = "seafoam",
  size = "medium",
  className = "",
  children,
  ...props
}) => {
  return (
    <Link
      href={link}
      passHref
      className={cn(
        baseClasses,
        color === "white"
          ? "text-primary-end hover:text-primary-via border border-seafoam-150 bg-gradient-to-br from-seafoam-50 to-seafoam-150"
          : color === "blue"
          ? "text-primary-via hover:text-primary-start border border-gray-100/60 bg-gradient-to-br from-white to-gray-50"
          : color === "ghost"
          ? "text-primary-via hover:text-primary-start"
          : color === "ghostBlue"
          ? "text-primary-via hover:text-primary-start border border-primary-via bg-white"
          : ""
      )}
      {...props}
    >
      {children}
    </Link>
  );
};

export const FlushButton = ({
  link = "/",
  color = "seafoam",
  className = "",
  children,
  ...props
}) => {
  return (
    <Link
      href={link}
      passHref
      className={cn(
        baseClasses,
        color === "white"
          ? "text-primary-end hover:text-primary-via border border-seafoam-150 bg-gradient-to-br from-seafoam-50 to-seafoam-150"
          : color === "blue"
          ? "text-primary-via hover:text-primary-start border border-gray-100/60 bg-gradient-to-br from-white to-gray-50"
          : color === "ghost"
          ? "text-primary-via hover:text-primary-start"
          : color === "ghostBlue"
          ? "text-primary-via hover:text-primary-start border border-primary-via bg-white"
          : ""
      )}
      {...props}
    >
      {children}
    </Link>
  );
};

export const ModalButton = ({
  color = "seafoam",
  size = "medium",
  className = "",
  children,
  ...props
}) => {
  return (
    <button
      className={cn(
        baseClasses,
        color === "white"
          ? "text-primary-end hover:text-primary-via border border-seafoam-150 bg-gradient-to-br from-seafoam-50 to-seafoam-150"
          : color === "blue"
          ? "text-primary-via hover:text-primary-start border border-gray-100/60 bg-gradient-to-br from-white to-gray-50"
          : color === "ghost"
          ? "text-primary-via hover:text-primary-start"
          : color === "ghostBlue"
          ? "text-primary-via hover:text-primary-start border border-primary-via bg-white"
          : ""
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export const ButtonGroup = ({ children }) => {
  return (
    <div className="w-full flex justify-start flex-wrap items-center gap-4">
      {children}
    </div>
  );
};
