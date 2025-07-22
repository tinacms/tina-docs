import React from "react";
import { FaArrowRight } from "react-icons/fa";

export const RedirectItem = ({ source, destination, permanent }) => {
  const displaySource = displayPath(source);
  const displayDestination = displayPath(destination);

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        <span className="text-orange-600 font-semibold">{displaySource}</span>
        <FaArrowRight className="text-slate-600 w-4 h-4" />
        <span className="text-green-600 font-semibold">
          {displayDestination}
        </span>
      </div>
      <div
        className={`rounded-full mr-4 px-2 py-0.5 text-xs opacity-70 ${
          permanent ? "bg-blue-100" : "border-2 bg-gray-100"
        }`}
        title={permanent ? "Permanent Redirect" : "Temporary Redirect"}
      >
        {permanent ? "permanent" : "temporary"}
      </div>
    </div>
  );
};

const displayPath = (path) => {
  if (!path) return "";
  if (path.replace("/", "").length === 0) return "home";
  return path.replace("/", "");
};
