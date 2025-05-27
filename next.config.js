const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");

/** @type {import('next').NextConfig} */

module.exports = {
  images: {
    remotePatterns: [],
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/admin",
        destination: "/admin/index.html",
      },
    ];
  },

  async redirects() {
    return [
      {
        source: "/",
        destination: "/docs",
        permanent: true,
      },
    ];
  },
  turbopack: {
    resolveExtensions: [".mdx", ".tsx", ".ts", ".jsx", ".js", ".mjs", ".json"],
    // Add this rule to handle SVG as React components for Local Development
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Configure Monaco Editor for minimal build
      config.plugins.push(
        new MonacoWebpackPlugin({
          languages: ["javascript"],
          filename: "static/[name].worker.js",
          features: ["!gotoSymbol"], // Disable heavy features
        })
      );
    }
    // Add this module rule to handle SVG as React components for Production
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};
