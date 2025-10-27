/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL + (process.env.NEXT_PUBLIC_BASE_PATH || ''),
  changefreq: "daily",
  priority: 0.7,
  sitemapSize: 5000,
  generateRobotsTxt: true,
  output: "standalone",
  outDir: "public",
  generateIndexSitemap: false,
  exclude: [
    '/tinadocs', // Exclude the bare base path URL that might be problematic
    '/admin/*', // Exclude admin routes
    '/api/*', // Exclude API routes
  ],
  transform: async (config, path) => {
    // Skip the root base path URL to avoid duplicates/redirects
    if (path === '/tinadocs' || path === '/tinadocs/') {
      return null;
    }
    
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };
  },
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api"],
      },
    ],
  },
};
