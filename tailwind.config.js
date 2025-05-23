/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");
const { blobBg } = require("./src/utils/backgrounds/svgs");

module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./src/styles/**/*.css",
  ],
  theme: {
    extend: {
      height: {
        18: "72px",
      },
      text: {
        "2xs": "10px",
      },
      backgroundImage: {
        "blob-bg": blobBg,
      },
      colors: {
        // Brand colors
        "brand-primary": "var(--brand-primary)",
        "brand-primary-hover": "var(--brand-primary-hover)",
        "brand-primary-light": "var(--brand-primary-light)",
        "brand-primary-dark": "var(--brand-primary-dark)",

        "brand-secondary": "var(--brand-secondary)",
        "brand-secondary-hover": "var(--brand-secondary-hover)",
        "brand-secondary-light": "var(--brand-secondary-light)",
        "brand-secondary-dark": "var(--brand-secondary-dark)",
        "brand-secondary-gradient-start":
          "var(--brand-secondary-gradient-start)",
        "brand-secondary-gradient-end": "var(--brand-secondary-gradient-end)",

        "brand-tertiary": "var(--brand-tertiary)",
        "brand-tertiary-hover": "var(--brand-tertiary-hover)",
        "brand-tertiary-light": "var(--brand-tertiary-light)",
        "brand-tertiary-dark": "var(--brand-tertiary-dark)",
        "brand-tertiary-gradient-start": "var(--brand-tertiary-gradient-start)",
        "brand-tertiary-gradient-end": "var(--brand-tertiary-gradient-end)",

        // Background gradients and glass
        "glass-gradient-start": "var(--glass-gradient-start)",
        "glass-gradient-end": "var(--glass-gradient-end)",
        "glass-hover-gradient-start": "var(--glass-hover-gradient-start)",
        "glass-hover-gradient-end": "var(--glass-hover-gradient-end)",
        "background-primary-gradient-start":
          "var(--background-primary-gradient-start)",
        "background-primary-gradient-end":
          "var(--background-primary-gradient-end)",

        // Neutral system
        "neutral-background": "var(--neutral-background)",
        "neutral-surface": "var(--neutral-surface)",
        "neutral-background-secondary": "var(--neutral-background-secondary)",
        "neutral-background-tertiary": "var(--neutral-background-tertiary)",
        "neutral-text": "var(--neutral-text)",
        "neutral-text-secondary": "var(--neutral-text-secondary)",
        "neutral-border": "var(--neutral-border)",
        seafoam: {
          50: "#EEFDF9",
          100: "#E9FBF4",
          150: "#C1F5EB",
          200: "#CFF5E6",
          300: "#B4EFD9",
          400: "#99E9CB",
          500: "#93E9BE",
          600: "#72C39B",
          700: "#529C7B",
          800: "#39745C",
          900: "#214C3D",
          950: "#122A21",
        },
      },
    },
    fontFamily: {
      tuner: ["tuner-medium", ...defaultTheme.fontFamily.sans],
      "tuner-regular": ["tuner-regular", ...defaultTheme.fontFamily.sans],
      mono: [
        "ui-monospace",
        "SFMono-Regular",
        "Menlo",
        "Monaco",
        "Consolas",
        "Liberation Mono",
        "Courier New",
        "monospace",
      ],
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".brand-glass-hover-gradient": {
          "background-image":
            "linear-gradient(to bottom right, var(--glass-gradient-hover-start), var(--glass-gradient-hover-end))",
        },
      });
    },
  ],
};
