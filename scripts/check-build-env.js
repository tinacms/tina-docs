// Fails a Cloudflare Workers Builds build early when the TinaCloud keys that
// `tinacms build` needs are missing. Does nothing outside Workers Builds.
const { isCloudflareBuild } = require("./deploy-target");

const REQUIRED = ["NEXT_PUBLIC_TINA_CLIENT_ID", "TINA_TOKEN"];

if (process.env.WORKERS_CI && isCloudflareBuild()) {
  const missing = REQUIRED.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    const message = [
      `\x1b[31mMissing build variable${missing.length === 1 ? "" : "s"}: ${missing.join(", ")}\x1b[0m`,
      "Add them as build variables in your Worker's Workers Builds settings in the Cloudflare dashboard.",
      "Runtime variables and secrets are not visible during the build, so they must be build variables.",
      "See https://developers.cloudflare.com/workers/ci-cd/builds/configuration/ and the README's Cloudflare section, then retry the build.",
    ];
    process.stderr.write(`${message.join("\n")}\n`);
    process.exit(1);
  }
}
