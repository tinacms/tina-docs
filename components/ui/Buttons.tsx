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
    " text-[var(--primary-color-end)] hover:text-[var(--primary-color-via)] border border-seafoam-150 bg-gradient-to-br from-seafoam-50 to-seafoam-150",
  blue:
    raisedButtonClasses +
    " text-white hover:text-gray-50 border border-[var(--secondary-color-start)] bg-gradient-to-br from-[var(--secondary-color-start)] via-[var(--secondary-color-via)] to-[var(--secondary-color-end)]",
  orange:
    raisedButtonClasses +
    " text-white hover:text-gray-50 border border-[var(--primary-color-end)] bg-gradient-to-br from-[var(--primary-color-start)] via-[var(--primary-color-via)] to-[var(--primary-color-end)]",
  white:
    raisedButtonClasses +
    " text-[var(--primary-color-via)] hover:text-[var(--primary-color-start)] border border-gray-100/60 bg-gradient-to-br from-white to-gray-50",
  ghost:
    "text-[var(--primary-color-via)] hover:text-[var(--primary-color-start)]",
  orangeWithBorder:
    "text-[var(--primary-color-via)] hover:text-[var(--primary-color-start)] border border-[var(--primary-color-via)] bg-white",
  ghostBlue:
    "text-[var(--secondary-color-end)] hover:text-[var(--secondary-color-via)]",
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
          ? "text-[var(--primary-color-end)] hover:text-[var(--primary-color-via)] border border-seafoam-150 bg-gradient-to-br from-seafoam-50 to-seafoam-150"
          : color === "blue"
          ? "text-[var(--primary-color-via)] hover:text-[var(--primary-color-start)] border border-gray-100/60 bg-gradient-to-br from-white to-gray-50"
          : color === "ghost"
          ? "text-[var(--primary-color-via)] hover:text-[var(--primary-color-start)]"
          : color === "ghostBlue"
          ? "text-[var(--primary-color-via)] hover:text-[var(--primary-color-start)] border border-[var(--primary-color-via)] bg-white"
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
          ? "text-[var(--primary-color-end)] hover:text-[var(--primary-color-via)] border border-seafoam-150 bg-gradient-to-br from-seafoam-50 to-seafoam-150"
          : color === "blue"
          ? "text-[var(--primary-color-via)] hover:text-[var(--primary-color-start)] border border-gray-100/60 bg-gradient-to-br from-white to-gray-50"
          : color === "ghost"
          ? "text-[var(--primary-color-via)] hover:text-[var(--primary-color-start)]"
          : color === "ghostBlue"
          ? "text-[var(--primary-color-via)] hover:text-[var(--primary-color-start)] border border-[var(--primary-color-via)] bg-white"
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
          ? "text-[var(--primary-color-end)] hover:text-[var(--primary-color-via)] border border-seafoam-150 bg-gradient-to-br from-seafoam-50 to-seafoam-150"
          : color === "blue"
          ? "text-[var(--primary-color-via)] hover:text-[var(--primary-color-start)] border border-gray-100/60 bg-gradient-to-br from-white to-gray-50"
          : color === "ghost"
          ? "text-[var(--primary-color-via)] hover:text-[var(--primary-color-start)]"
          : color === "ghostBlue"
          ? "text-[var(--primary-color-via)] hover:text-[var(--primary-color-start)] border border-[var(--primary-color-via)] bg-white"
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
          ? "text-[var(--primary-color-end)] hover:text-[var(--primary-color-via)] border border-seafoam-150 bg-gradient-to-br from-seafoam-50 to-seafoam-150"
          : color === "blue"
          ? "text-[var(--primary-color-via)] hover:text-[var(--primary-color-start)] border border-gray-100/60 bg-gradient-to-br from-white to-gray-50"
          : color === "ghost"
          ? "text-[var(--primary-color-via)] hover:text-[var(--primary-color-start)]"
          : color === "ghostBlue"
          ? "text-[var(--primary-color-via)] hover:text-[var(--primary-color-start)] border border-[var(--primary-color-via)] bg-white"
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
