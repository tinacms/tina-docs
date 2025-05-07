const fs = require("node:fs");
const path = require("node:path");

const sourceDir = path.join(process.cwd(), "out", "_pagefind");
const targetDir = path.join(process.cwd(), "out", "_pagefind");

// Ensure target directory exists
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Copy all files from source to target
const files = fs.readdirSync(sourceDir);
for (const file of files) {
  const sourcePath = path.join(sourceDir, file);
  const targetPath = path.join(targetDir, file);

  if (fs.statSync(sourcePath).isFile()) {
    fs.copyFileSync(sourcePath, targetPath);
  }
}
