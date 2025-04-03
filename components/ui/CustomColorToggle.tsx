import React from "react";
import { cn } from "../../utils/cn";

export const CustomColorToggle = ({ input }) => {
  const { value = {}, onChange } = input;
  const disableColor = value.disableColor || false;
  const colorValue = value.colorValue || "#000000";

  const handleCheckboxChange = (e) => {
    onChange({ ...value, disableColor: e.target.checked });
  };

  const handleColorChange = (e) => {
    onChange({ ...value, colorValue: e.target.value });
  };

  return (
    <>
      <label className="block font-semibold text-xs text-gray-700 mb-2">
        Custom Background Selector
      </label>
      <div className="flex items-center pt-2">
        <label className="flex items-center cursor-pointer">
          <div className="relative shadow-lg">
            <input
              type="checkbox"
              checked={disableColor}
              onChange={handleCheckboxChange}
              className="sr-only"
            />

            <div
              className={cn(
                "w-10 h-5 rounded-full shadow-inner transition-colors duration-200",
                disableColor ? "bg-green-500" : "bg-gray-300"
              )}
            ></div>

            <div
              className={cn(
                "absolute w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 left-0 top-0",
                disableColor ? "translate-x-full" : ""
              )}
            ></div>
          </div>
          <span className="ml-3 text-gray-700">
            Tick to use Default Background Color
          </span>
        </label>
        {/* Color Picker */}
        <div style={{ marginLeft: "1rem", opacity: disableColor ? 0.5 : 1 }}>
          <input
            type="color"
            value={colorValue}
            onChange={handleColorChange}
            disabled={disableColor}
            className="w-10 h-10 border border-gray-300 rounded"
          />
        </div>
      </div>
    </>
  );
};
