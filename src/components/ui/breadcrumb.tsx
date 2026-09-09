// Mirrors the SSW Design System breadcrumb
// (https://design.ssw.com.au/r/breadcrumb.json), styled with TinaDocs tokens.
import Link from "next/link";
import type { ComponentProps } from "react";
import { MdChevronRight, MdMoreHoriz } from "react-icons/md";

export const Breadcrumb = ({
  className = "",
  ...props
}: ComponentProps<"nav">) => (
  <nav
    aria-label="breadcrumb"
    data-slot="breadcrumb"
    className={className}
    {...props}
  />
);

export const BreadcrumbList = ({
  className = "",
  ...props
}: ComponentProps<"ol">) => (
  <ol
    data-slot="breadcrumb-list"
    className={`flex min-w-0 items-center gap-1.5 overflow-hidden text-sm text-neutral-text-secondary ${className}`}
    {...props}
  />
);

export const BreadcrumbItem = ({
  className = "",
  ...props
}: ComponentProps<"li">) => (
  <li
    data-slot="breadcrumb-item"
    className={`inline-flex min-w-0 items-center gap-1 ${className}`}
    {...props}
  />
);

export const BreadcrumbLink = ({
  className = "",
  ...props
}: ComponentProps<typeof Link>) => (
  <Link
    data-slot="breadcrumb-link"
    className={`transition-colors hover:text-brand-primary ${className}`}
    {...props}
  />
);

export const BreadcrumbPage = ({
  className = "",
  ...props
}: ComponentProps<"span">) => (
  <span
    data-slot="breadcrumb-page"
    aria-current="page"
    className={`font-medium text-neutral-text ${className}`}
    {...props}
  />
);

export const BreadcrumbSeparator = ({
  children,
  className = "",
  ...props
}: ComponentProps<"li">) => (
  <li
    data-slot="breadcrumb-separator"
    role="presentation"
    aria-hidden="true"
    className={`shrink-0 [&>svg]:size-3.5 ${className}`}
    {...props}
  >
    {children ?? <MdChevronRight />}
  </li>
);

export const BreadcrumbEllipsis = ({
  className = "",
  ...props
}: ComponentProps<"span">) => (
  <span
    data-slot="breadcrumb-ellipsis"
    role="presentation"
    aria-hidden="true"
    className={`flex size-5 items-center justify-center [&>svg]:size-4 ${className}`}
    {...props}
  >
    <MdMoreHoriz />
  </span>
);
