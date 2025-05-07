const fs = require("node:fs");
const path = require("node:path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
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

  // Ensure Pagefind files are copied to the output directory
  async headers() {
    return [
      {
        source: "/_pagefind/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

// Create _pagefind directory in out folder if it doesn't exist
if (process.env.NODE_ENV === "production") {
  const outDir = path.join(process.cwd(), "out");
  const pagefindDir = path.join(outDir, "_pagefind");

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  if (!fs.existsSync(pagefindDir)) {
    fs.mkdirSync(pagefindDir, { recursive: true });
  }
}

module.exports = nextConfig;
