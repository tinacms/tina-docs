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
        "brand-primary-text": "var(--brand-primary-text)",
        "brand-primary-contrast": "var(--brand-primary-contrast)",

        "brand-secondary": "var(--brand-secondary)",
        "brand-secondary-hover": "var(--brand-secondary-hover)",
        "brand-secondary-light": "var(--brand-secondary-light)",
        "brand-secondary-text": "var(--brand-secondary-text)",
        "brand-secondary-contrast": "var(--brand-secondary-contrast)",

        "brand-secondary-gradient-start":
          "var(--brand-secondary-gradient-start)",
        "brand-secondary-gradient-end": "var(--brand-secondary-gradient-end)",

        "brand-tertiary": "var(--brand-tertiary)",
        "brand-tertiary-hover": "var(--brand-tertiary-hover)",
        "brand-tertiary-light": "var(--brand-tertiary-light)",
        "brand-tertiary-text": "var(--brand-tertiary-text)",
        "brand-tertiary-contrast": "var(--brand-tertiary-contrast)",

        "brand-tertiary-gradient-start": "var(--brand-tertiary-gradient-start)",
        "brand-tertiary-gradient-end": "var(--brand-tertiary-gradient-end)",

        // Background gradients and glass
        "glass-gradient-start": "var(--glass-gradient-start)",
        "glass-gradient-end": "var(--glass-gradient-end)",
        "background-primary-gradient-start":
          "var(--background-primary-gradient-start)",
        "background-primary-gradient-end":
          "var(--background-primary-gradient-end)",

        "background-color": "var(--background-color)",

        // Neutral system
        "neutral-background": "var(--neutral-background)",
        "neutral-surface": "var(--neutral-surface)",
        "neutral-background-secondary": "var(--neutral-background-secondary)",
        "neutral-text": "var(--neutral-text)",
        "neutral-text-secondary": "var(--neutral-text-secondary)",
        "neutral-border": "var(--neutral-border)",
        "neutral-border-subtle": "var(--neutral-border-subtle)",
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
  plugins: [],
};
