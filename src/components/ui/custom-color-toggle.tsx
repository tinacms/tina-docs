import React from "react";

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
      <label className="mb-2 block text-xs font-semibold text-gray-700">
        Custom Background Selector
      </label>
      <div className="flex items-center pt-2">
        <label className="flex cursor-pointer items-center">
          <div className="relative shadow-lg">
            <input
              type="checkbox"
              checked={disableColor}
              onChange={handleCheckboxChange}
              className="sr-only"
            />

            <div
              className={`h-5 w-10 rounded-full shadow-inner transition-colors duration-200 ${
                disableColor ? "bg-green-500" : "bg-gray-300"
              }`}
            />

            <div
              className={`absolute left-0 top-0 size-5 rounded-full bg-white shadow transition-transform duration-200 ${
                disableColor ? "translate-x-full" : ""
              }`}
            />
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
            className="size-10 rounded border border-gray-300"
          />
        </div>
      </div>
    </>
  );
};
