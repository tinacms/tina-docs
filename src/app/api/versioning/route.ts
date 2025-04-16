import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";

export async function POST(request: Request) {
  try {
    const { versionNumber, operation } = await request.json();

    if (!versionNumber || !operation) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 },
      );
    }

    // Get the content directory path
    const contentDir = path.join(process.cwd(), "content");
    const versionsDir = path.join(contentDir, "_versions");
    const versionDir = path.join(versionsDir, versionNumber);

    // Ensure versions directory exists
    if (!fs.existsSync(versionsDir)) {
      fs.mkdirSync(versionsDir, { recursive: true });
    }

    // Ensure version directory exists
    if (!fs.existsSync(versionDir)) {
      fs.mkdirSync(versionDir, { recursive: true });
    }

    switch (operation) {
      case "createDocs":
        await createDocsCopy(contentDir, versionDir);
        break;
      case "createToc":
        await createTocCopy(contentDir, versionDir);
        break;
      default:
        return NextResponse.json(
          { error: "Invalid operation" },
          { status: 400 },
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in versioning operation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

async function createDocsCopy(contentDir: string, versionDir: string) {
  // Copy all files and directories except _versions
  const files = fs.readdirSync(contentDir);

  for (const file of files) {
    if (file === "_versions") continue;

    const sourcePath = path.join(contentDir, file);
    const targetPath = path.join(versionDir, file);

    if (fs.statSync(sourcePath).isDirectory()) {
      // Recursively copy directory
      copyDirectory(sourcePath, targetPath);
    } else if (file.endsWith(".mdx")) {
      // Copy file
      fs.copyFileSync(sourcePath, targetPath);
    }
  }

  // Create version index file
  const versionIndexPath = path.join(versionDir, "_version-index.mdx");
  fs.writeFileSync(versionIndexPath, "");
}

async function createTocCopy(contentDir: string, versionDir: string) {
  // Copy the TOC file
  const tocSourcePath = path.join(contentDir, "_toc.json");
  const tocTargetPath = path.join(versionDir, "_toc.json");

  if (fs.existsSync(tocSourcePath)) {
    fs.copyFileSync(tocSourcePath, tocTargetPath);
  }
}

function copyDirectory(sourceDir: string, targetDir: string) {
  // Create target directory if it doesn't exist
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Copy all files and directories
  const files = fs.readdirSync(sourceDir);

  for (const file of files) {
    if (file === "_versions") continue;

    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(targetDir, file);

    if (fs.statSync(sourcePath).isDirectory()) {
      copyDirectory(sourcePath, targetPath);
    } else if (file.endsWith(".mdx")) {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}
