import React from "react";
import { wrapFieldsWithMeta } from "tinacms";

// Theme definitions with their color palettes
const themes = [
  {
    value: "default",
    label: "Default",
    description: "Clean monochrome design",
    colors: {
      primary: "#0f172a",
      secondary: "#64748b",
      accent: "#e2e8f0",
    },
  },
  {
    value: "tina",
    label: "Tina",
    description: "TinaCMS-inspired orange & blue",
    colors: {
      primary: "#EC4815",
      secondary: "#0084FF",
      accent: "#93E9BE",
    },
  },
  {
    value: "blossom",
    label: "Blossom",
    description: "Elegant pink & rose tones",
    colors: {
      primary: "#e54666",
      secondary: "#dc3b5d",
      accent: "#ffcdcf",
    },
  },
  {
    value: "lake",
    label: "Lake",
    description: "Professional blue palette",
    colors: {
      primary: "#0090FF",
      secondary: "#3b82f6",
      accent: "#bfdbfe",
    },
  },
  {
    value: "pine",
    label: "Pine",
    description: "Natural green tones",
    colors: {
      primary: "#30A46C",
      secondary: "#5bb98c",
      accent: "#c4e8d1",
    },
  },
  {
    value: "indigo",
    label: "Indigo",
    description: "Modern purple & violet",
    colors: {
      primary: "#6E56CF",
      secondary: "#b197fc",
      accent: "#e1d9ff",
    },
  },
];

const ThemeOption = ({ theme, isSelected, onClick, key }) => {
  return (
    <div
      className={`
        relative p-4 rounded-lg border cursor-pointer transition-all duration-200 bg-white shadow-sm
        ${
          isSelected
            ? "border-blue-500 "
            : "border-gray-200 hover:border-gray-300 hover:shadow-md"
        }
      `}
      onClick={onClick}
    >
      {/* Color palette preview */}
      <div className="flex space-x-2 mb-3">
        <div
          className="w-6 h-6 rounded-full border border-gray-200 shadow-sm"
          style={{ backgroundColor: theme.colors.primary }}
          title={`Primary: ${theme.colors.primary}`}
        />
        <div
          className="w-6 h-6 rounded-full border border-gray-200 shadow-sm"
          style={{ backgroundColor: theme.colors.secondary }}
          title={`Secondary: ${theme.colors.secondary}`}
        />
        <div
          className="w-6 h-6 rounded-full border border-gray-200 shadow-sm"
          style={{ backgroundColor: theme.colors.accent }}
          title={`Accent: ${theme.colors.accent}`}
        />
      </div>

      {/* Theme info */}
      <div>
        <div className="font-semibold text-gray-800 mb-1">{theme.label}</div>
        <div className="text-sm text-gray-600">{theme.description}</div>
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2">
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
            <svg
              className="w-3 h-3 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

export const ThemeSelector = wrapFieldsWithMeta(({ input, field }) => {
  const currentValue = input.value || "default";

  const handleThemeChange = (themeValue: string) => {
    input.onChange(themeValue);
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {themes.map((theme) => (
          <ThemeOption
            key={`theme-${theme.value}`}
            theme={theme}
            isSelected={currentValue === theme.value}
            onClick={() => handleThemeChange(theme.value)}
          />
        ))}
      </div>

      {/* Current selection display */}
      <div className="mt-4 p-3 bg-gray-50 rounded-md">
        <div className="text-sm text-gray-600">
          Current theme:{" "}
          <span className="font-semibold text-gray-800">
            {themes.find((t) => t.value === currentValue)?.label ||
              currentValue}
          </span>
        </div>
      </div>
    </div>
  );
});
