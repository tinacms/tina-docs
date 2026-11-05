// Picks the deploy target from the host's own build environment, like
// tina-astro-starter. DEPLOY_ADAPTER=cloudflare forces a Cloudflare build
// (for example, a local preview); any other value forces the default output.
const isCloudflareBuild = () =>
  process.env.DEPLOY_ADAPTER
    ? process.env.DEPLOY_ADAPTER === "cloudflare"
    : Boolean(process.env.WORKERS_CI);

module.exports = { isCloudflareBuild };
