const fs = require("fs");
const path = require("path");

const entryPath = path.join(__dirname, "..", "public", "pagefind", "pagefind-entry.json");

if (!fs.existsSync(entryPath)) {
  console.warn(
    "\x1b[33m⚠  Pagefind index not found. Search will not work in dev.\n" +
    "   Run: pnpm build-local-pagefind\x1b[0m\n"
  );
  process.exit(0);
}

const stats = fs.statSync(entryPath);
const ageMs = Date.now() - stats.mtimeMs;
const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));

if (ageDays >= 7) {
  console.warn(
    `\x1b[33m⚠  Pagefind index is ${ageDays} day${ageDays === 1 ? "" : "s"} old. Search results may be stale.\n` +
    "   Run: pnpm build-local-pagefind\x1b[0m\n"
  );
}
