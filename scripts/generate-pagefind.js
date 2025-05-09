const puppeteer = require("puppeteer");
const fs = require("node:fs");
const path = require("node:path");
const glob = require("glob");

// Detect whether it's using pages or app directory
const buildDir = fs.existsSync(".next/server/pages")
  ? ".next/server/pages"
  : ".next/server/app";

const outputDir = "temp-out";
const baseUrl = "http://localhost:3000";

// Helper: convert file paths to route paths
function filePathToRoute(filePath) {
  // biome-ignore lint/style/useConst: <explanation>
  let route = filePath
    .replace(buildDir, "")
    .replace(/\/index\.html$/, "/")
    .replace(/\.html$/, "")
    .replace(/\.js$/, "")
    .replace(/\[.*?\]/g, ""); // skip dynamic routes

  return route === "" ? "/" : route;
}

// Step 1: Collect routes
const htmlFiles = glob.sync(`${buildDir}/**/*.{html,js}`);
const routes = htmlFiles
  .map(filePathToRoute)
  .filter((route) => !route.includes("_") && !route.includes("["))
  .filter((value, index, self) => self.indexOf(value) === index); // remove duplicates

// Step 2: Start Puppeteer to crawl and save
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  fs.rmSync(outputDir, { recursive: true, force: true });
  fs.mkdirSync(outputDir, { recursive: true });

  for (const route of routes) {
    const url = `${baseUrl}${route}`;
    await page.goto(url, { waitUntil: "networkidle0" });

    const html = await page.content();
    const filePath = path.join(
      outputDir,
      route === "/" ? "index.html" : `${route.replace(/^\//, "")}.html`
    );

    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, html);
  }

  await browser.close();
})();
