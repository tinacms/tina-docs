import fs from "node:fs";
import path from "node:path";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Recursively deletes all files and subdirectories in a directory
 */
function clearDirectoryRecursive(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    return; // Directory doesn't exist, nothing to clear
  }

  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
      // Recursively clear subdirectory
      clearDirectoryRecursive(itemPath);
      // Remove the empty directory
      fs.rmdirSync(itemPath);
    } else {
      // Remove file
      fs.unlinkSync(itemPath);
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { directoryPath } = body;

    if (!directoryPath) {
      return NextResponse.json(
        { error: "Directory path is required" },
        { status: 400 }
      );
    }

    // Security check: ensure the path is within the content directory
    const contentDir = path.join(process.cwd(), "content");
    const targetPath = path.join(contentDir, directoryPath);
    const resolvedTargetPath = path.resolve(targetPath);
    const resolvedContentDir = path.resolve(contentDir);

    if (!resolvedTargetPath.startsWith(resolvedContentDir)) {
      return NextResponse.json(
        { error: "Invalid directory path - must be within content directory" },
        { status: 400 }
      );
    }

    // Check if we're in a development environment
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        {
          error: "Directory clearing is not allowed in production",
          suggestion: "Use TinaCMS GraphQL mutations instead",
        },
        { status: 403 }
      );
    }

    // Clear the directory
    clearDirectoryRecursive(targetPath);

    // Recreate the directory (empty)
    if (!fs.existsSync(targetPath)) {
      fs.mkdirSync(targetPath, { recursive: true });
    }

    return NextResponse.json(
      {
        success: true,
        message: `Directory ${directoryPath} cleared successfully`,
        clearedPath: path.relative(process.cwd(), targetPath),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to clear directory",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
