/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: `${process.env.NEXT_PUBLIC_SITE_URL}${process.env.NEXT_PUBLIC_BASE_PATH || ''}`,
  changefreq: "daily",
  priority: 0.7,
  sitemapSize: 5000,
  generateRobotsTxt: true,
  output: "standalone",
  outDir: "public/doc",
  generateIndexSitemap: false,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
  },
};
