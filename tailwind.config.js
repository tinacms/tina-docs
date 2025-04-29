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
      backgroundImage: {
        "blob-bg": blobBg,
      },
      colors: {
        primary: "var(--primay-color)",
        example: "#4f46e5",
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
