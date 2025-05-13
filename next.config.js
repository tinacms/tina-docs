const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");

const isStatic = process.env.EXPORT_MODE === "static";

/** @type {import('next').NextConfig} */
// biome-ignore lint/style/useConst: <explanation>
let extraConfig = {};

if (isStatic) {
  extraConfig.output = "export";
  extraConfig.images = {
    unoptimized: true,
  };
}

const nextConfig = {
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
    return config;
  },
};

module.exports = nextConfig;
