/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

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
        primaryStart: 'var(--primary-color-start)',
        primaryVia: 'var(--primary-color-via)',
        primaryEnd: 'var(--primary-color-end)',
      },
    },
    fontFamily: {
      tuner: ['tuner-medium', ...defaultTheme.fontFamily.sans],
      'tuner-regular': ['tuner-regular', ...defaultTheme.fontFamily.sans],
    },
  },
  plugins: [],
};
