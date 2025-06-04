import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {

  // Only allow in development environment for security
  if (process.env.NODE_ENV !== "development") {
    
    return NextResponse.json(
      {
        error:
          "Directory clearing is only available in development environment",
        suggestion:
          "Use TinaCMS GraphQL API for directory clearing in production",
      },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    
    const { directoryPath } = body;

    if (!directoryPath || typeof directoryPath !== "string") {
      return NextResponse.json(
        { error: "directoryPath is required" },
        { status: 400 }
      );
    }

    // Ensure the directory path is within the content directory for security
    const contentDir = path.join(process.cwd(), "content");
    const fullPath = path.join(contentDir, directoryPath);
    const normalizedPath = path.normalize(fullPath);


    if (!normalizedPath.startsWith(contentDir)) {
      return NextResponse.json(
        {
          error: "Invalid directory path - must be within content directory",
        },
        { status: 400 }
      );
    }

    // Check if directory exists
    if (!fs.existsSync(normalizedPath)) {
      
      return NextResponse.json(
        {
          message: "Directory does not exist (nothing to clear)",
        },
        { status: 200 }
      );
    }

    // Check if it's actually a directory
    const stats = fs.statSync(normalizedPath);
    if (!stats.isDirectory()) {
      return NextResponse.json(
        {
          error: "Path is not a directory",
        },
        { status: 400 }
      );
    }

    // Recursively remove all contents of the directory
    const deletedFiles: string[] = [];
    function clearDirectoryRecursive(dirPath: string) {
      const files = fs.readdirSync(dirPath);

      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const fileStats = fs.statSync(filePath);

        if (fileStats.isDirectory()) {
          clearDirectoryRecursive(filePath);
          fs.rmdirSync(filePath);
          
        } else {
          fs.unlinkSync(filePath);
          const relativePath = path.relative(contentDir, filePath);
          deletedFiles.push(relativePath);
          
        }
      }
    }

    clearDirectoryRecursive(normalizedPath);

    return NextResponse.json(
      {
        message: "Directory cleared successfully",
        clearedDirectory: directoryPath,
        deletedFiles: deletedFiles,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error clearing directory:", error);
    return NextResponse.json(
      {
        error: "Failed to clear directory",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
