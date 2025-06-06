import React from "react";
import { FaArrowRight } from "react-icons/fa";

export const RedirectItem = ({ source, destination, permanent }) => {
  const displaySource = displayPath(source);
  const displayDestination = displayPath(destination);

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        <span className="text-blue-600 font-medium">{displaySource}</span>
        <FaArrowRight className="text-orange-500 w-4 h-4" />
        <span className="text-green-600 font-medium">{displayDestination}</span>
      </div>
      <div
        className={`w-3 h-3 rounded-full mr-4 ${
          permanent ? "bg-green-500" : "border-2 border-gray-400"
        }`}
        title={permanent ? "Permanent Redirect" : "Temporary Redirect"}
      />
    </div>
  );
};

const displayPath = (path) => {
  if (!path) return "";
  if (path.replace("/", "").length === 0) return "home";
  return path.replace("/", "");
};
