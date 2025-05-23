import Link from "next/link";
import type React from "react";

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
  seafoam: `${raisedButtonClasses} text-orange-600 hover:text-orange-500 border border-seafoam-150 bg-gradient-to-br from-seafoam-50 to-seafoam-150`,
  blue: `${raisedButtonClasses} text-white hover:text-gray-50 border border-blue-400 bg-gradient-to-br from-blue-300 via-blue-400 to-blue-600`,
  orange: `${raisedButtonClasses} text-white hover:text-gray-50 border border-orange-600 bg-gradient-to-br from-orange-400 to-orange-600`,
  white: `${raisedButtonClasses} text-orange-500 hover:text-orange-400 border border-gray-100/60 bg-gradient-to-br from-white to-gray-50`,
  ghost: "text-orange-500 hover:text-orange-400",
  orangeWithBorder:
    "text-orange-500 hover:text-orange-400 border border-orange-500 bg-white",
  ghostBlue: "text-blue-800 hover:text-blue-800",
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
      className={`${baseClasses} ${
        colorClasses[color] ? colorClasses[color] : colorClasses.seafoam
      } ${
        sizeClasses[size] ? sizeClasses[size] : sizeClasses.medium
      } ${className}`}
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
      className={`${baseClasses} ${
        colorClasses[color] ? colorClasses[color] : colorClasses.seafoam
      } ${
        sizeClasses[size] ? sizeClasses[size] : sizeClasses.medium
      } ${className}`}
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
      className={`${baseClasses} ${
        colorClasses[color] ? colorClasses[color] : colorClasses.seafoam
      } ${"hover:inner-link border-none bg-none p-2 hover:translate-x-0 hover:translate-y-0 hover:shadow-none"} ${className}`}
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
      className={`${baseClasses} ${
        colorClasses[color] ? colorClasses[color] : colorClasses.seafoam
      } ${
        sizeClasses[size] ? sizeClasses[size] : sizeClasses.medium
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const ButtonGroup = ({ children }) => {
  return (
    <div className="flex w-full flex-wrap items-center justify-start gap-4">
      {children}
    </div>
  );
};
