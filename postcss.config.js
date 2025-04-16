module.exports = {
  plugins: {
    "@tailwindcss/postcss": {},
    "postcss-preset-env": {
      features: {
        "color-adjust": true,
      },
    },
    autoprefixer: {},
  },
};
