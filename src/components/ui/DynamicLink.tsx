import Link, { type LinkProps } from "next/link";
import type React from "react";

type ExtraProps = Omit<LinkProps, "as" | "href">;

interface DynamicLinkProps extends ExtraProps {
  href: string;
  children?: React.ReactNode;
}

export const DynamicLink = ({ href, children, ...props }: DynamicLinkProps) => {
  return (
    <Link href={href} {...props} className="cursor-pointer">
      {children}
    </Link>
  );
};
