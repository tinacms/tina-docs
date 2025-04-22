module.exports = {
  plugins: {
    tailwindcss: {},
    "@tailwindcss/postcss": {},
    "postcss-preset-env": {
      features: {
        "color-adjust": true,
      },
    },
    autoprefixer: {},
  },
};
