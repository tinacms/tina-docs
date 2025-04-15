import fs from "fs-extra";
import path from "path";

const createDocsCopy = async (versionNumber: string) => {
  const sourceDir = path.join(process.cwd(), "content/docs");
  const targetDir = path.join(
    process.cwd(),
    "content/docs/_versions",
    versionNumber,
  );

  // Create the target directory if it doesn't exist
  await fs.ensureDir(targetDir);

  // Copy all files and directories except _versions
  const items = await fs.readdir(sourceDir);

  for (const item of items) {
    if (item === "_versions") continue;

    const sourcePath = path.join(sourceDir, item);
    const targetPath = path.join(targetDir, item);

    const stats = await fs.stat(sourcePath);

    if (stats.isDirectory()) {
      await fs.copy(sourcePath, targetPath, {
        filter: (src) => !src.includes("_versions"),
      });
    } else if (stats.isFile() && item.endsWith(".mdx")) {
      await fs.copy(sourcePath, targetPath);
    }
  }

  // Create version index file
  const versionIndexPath = path.join(targetDir, "_version-index.mdx");
  await fs.writeFile(versionIndexPath, "");
};

//Creating document copy
export const createDocs = async (versionNumber: string) => {
  await createDocsCopy(versionNumber);
};
