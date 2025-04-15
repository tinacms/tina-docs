import fs from "fs-extra";
import path from "path";

//Creating table of contents copy
export const createToc = async (versionNumber: string) => {
  const sourceDir = path.join(process.cwd(), "content/docs-toc");
  const targetDir = path.join(
    process.cwd(),
    "content/docs-toc/_versions",
    versionNumber,
  );

  // Create the target directory if it doesn't exist
  await fs.ensureDir(targetDir);

  // Copy the DocsTableOfContents.json file
  const sourceFile = path.join(sourceDir, "DocsTableOfContents.json");
  const targetFile = path.join(targetDir, "DocsTableOfContents.json");

  await fs.copy(sourceFile, targetFile);

  // Create version index file
  const versionIndexPath = path.join(targetDir, "_version-index.json");
  await fs.writeFile(versionIndexPath, "{}");
};
