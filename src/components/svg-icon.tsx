import React from "react";

interface SVGIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  fill?: string;
  paths: React.ReactNode;
}

export const SVGIcon: React.FC<SVGIconProps> = ({
  size = 24,
  fill = "currentColor",
  paths,
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {paths}
  </svg>
);
