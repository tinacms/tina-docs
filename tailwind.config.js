/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "blob-bg": 'url("/svg/default-background.svg")',
      },
      colors: {
        primary: {
          start: "var(--primary-color-start)",
          via: "var(--primary-color-via)",
          end: "var(--primary-color-end)",
        },
        secondary: {
          start: "var(--secondary-color-start)",
          via: "var(--secondary-color-via)",
          end: "var(--secondary-color-end)",
        },
      },
    },
    fontFamily: {
      tuner: ["tuner-medium", ...defaultTheme.fontFamily.sans],
      "tuner-regular": ["tuner-regular", ...defaultTheme.fontFamily.sans],
    },
  },
  plugins: [],
};
