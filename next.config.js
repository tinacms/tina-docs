/** @type {import('next').NextConfig} */

module.exports = {
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
};
