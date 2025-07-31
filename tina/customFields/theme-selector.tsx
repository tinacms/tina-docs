import React, { type FC } from "react";
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

interface ThemeOptionProps {
  theme: {
    value: string;
    label: string;
    description: string;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
  };
  isSelected: boolean;
  onClick: () => void;
}

const ThemeOption: FC<ThemeOptionProps> = ({ theme, isSelected, onClick }) => {
  return (
    <div
      className={`
        relative p-4 rounded-lg border cursor-pointer transition-all duration-200 bg-white max-w-sm hover:shadow-md
        ${
          isSelected
            ? "border-blue-500 shadow-md"
            : "border-gray-200 hover:border-gray-300 shadow-sm"
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
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {themes.map((theme, index) => (
          <ThemeOption
            key={`theme-${theme.value}-${index}`}
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
      {/* Instructions for custom themes */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-wrap">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-blue-800 mb-1">
              Want to create a custom theme?
            </h3>
            <p className="text-sm text-blue-700 mb-2">
              You can create your own custom themes by modifying the CSS
              variables in the global stylesheet. See the{" "}
              <a
                href="https://github.com/tinacms/tina-docs#custom-theming"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline font-medium"
              >
                Custom Theming section in the README
              </a>{" "}
              for detailed instructions on how to create new themes.
            </p>
            <div className="text-xs text-blue-600">
              <strong>Files to modify:</strong>{" "}
              <code className="bg-blue-100 px-1 rounded">
                src/styles/global.css
              </code>
              ,
              <code className="bg-blue-100 px-1 rounded">
                tina/customFields/theme-selector.tsx
              </code>
              , and
              <code className="bg-blue-100 px-1 rounded">
                src/components/ui/theme-selector.tsx
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
