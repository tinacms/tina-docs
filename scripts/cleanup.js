#!/usr/bin/env node

/**
 * TinaDocs API Documentation Cleanup Script
 *
 * This script helps TinaDocs users clean up auto-generated API documentation
 * while preserving manually created overview documents.
 *
 * Usage:
 *   pnpm run cleanup
 *
 * What it does:
 * 1. Deletes the entire API documentation directory
 * 2. Deletes all example documentation files
 * 3. Deletes docs-assets and landing-assets image folders
 * 4. Completely removes the API tab from navigation
 * 5. Cleans up all API-related content
 */

const fs = require("fs");
const path = require("path");

console.log("🧹 TinaDocs API Documentation Cleanup\n");

// Paths (relative to project root)
const apiDocsPath = path.join(process.cwd(), "content/docs/api-documentation");
const examplesPath = path.join(process.cwd(), "content/docs/examples");
const docsAssetsPath = path.join(process.cwd(), "public/img/docs-assets");
const landingAssetsPath = path.join(process.cwd(), "public/img/landing-assets");
const navigationPath = path.join(
  process.cwd(),
  "content/navigation-bar/docs-navigation-bar.json"
);

/**
 * Validate that we're in a TinaDocs project
 */
function validateTinaDocsProject() {
  const requiredPaths = [
    "content/docs",
    "content/navigation-bar",
    "tina/config.ts",
  ];

  for (const requiredPath of requiredPaths) {
    if (!fs.existsSync(path.join(process.cwd(), requiredPath))) {
      console.error(`❌ Error: This doesn't appear to be a TinaDocs project.`);
      console.error(`   Missing required path: ${requiredPath}`);
      console.error(
        `   Please run this script from your TinaDocs project root.`
      );
      process.exit(1);
    }
  }

  console.log("✅ TinaDocs project detected\n");
}

/**
 * Recursively delete a directory and all its contents
 */
function deleteDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(
      `⚠️  Directory not found: ${path.relative(process.cwd(), dirPath)}`
    );
    return false;
  }

  console.log(
    `🗑️  Deleting directory: ${path.relative(process.cwd(), dirPath)}`
  );

  try {
    const files = fs.readdirSync(dirPath);
    let fileCount = 0;

    // Delete each file/directory
    files.forEach((file) => {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        deleteDirectory(filePath); // Recursive delete
      } else {
        console.log(`   📄 Deleting file: ${file}`);
        fs.unlinkSync(filePath);
        fileCount++;
      }
    });

    // Remove the now-empty directory
    fs.rmdirSync(dirPath);
    console.log(
      `✅ Directory deleted: ${path.basename(dirPath)} (${fileCount} files)\n`
    );
    return true;
  } catch (error) {
    console.error(
      `❌ Error deleting directory ${path.basename(dirPath)}:`,
      error.message
    );
    return false;
  }
}

/**
 * Update navigation to completely remove API tab
 */
function updateNavigation() {
  console.log("📝 Updating navigation...");

  if (!fs.existsSync(navigationPath)) {
    console.log("⚠️  Navigation file not found - skipping navigation update");
    return false;
  }

  try {
    // Read the navigation file
    const navigationData = JSON.parse(fs.readFileSync(navigationPath, "utf8"));

    // Find and remove the API tab completely
    const originalTabCount = navigationData.tabs?.length || 0;

    if (navigationData.tabs) {
      navigationData.tabs = navigationData.tabs.filter(
        (tab) => tab.title !== "API"
      );
    }

    const newTabCount = navigationData.tabs?.length || 0;
    const removedTabs = originalTabCount - newTabCount;

    if (removedTabs > 0) {
      console.log(`   🗑️  Completely removed API tab from navigation`);

      // Write back to file
      fs.writeFileSync(navigationPath, JSON.stringify(navigationData, null, 2));
      console.log("✅ Navigation updated successfully\n");
    } else {
      console.log("   ℹ️  No API tab found to remove\n");
    }

    return true;
  } catch (error) {
    console.error("❌ Error updating navigation:", error.message);
    return false;
  }
}

/**
 * Clean up examples directory
 */
function cleanupExamplesDirectory() {
  if (!fs.existsSync(examplesPath)) {
    console.log("⚠️  Examples directory not found - nothing to clean up");
    return { deleted: [], fileCount: 0 };
  }

  console.log(
    `🗑️  Deleting examples directory: ${path.relative(
      process.cwd(),
      examplesPath
    )}`
  );

  try {
    const files = fs.readdirSync(examplesPath);
    const deletedFiles = [];
    let fileCount = 0;

    // Delete each file
    files.forEach((file) => {
      const filePath = path.join(examplesPath, file);
      const stat = fs.statSync(filePath);

      if (stat.isFile()) {
        console.log(`   📄 Deleting file: ${file}`);
        fs.unlinkSync(filePath);
        deletedFiles.push(file);
        fileCount++;
      }
    });

    // Remove the now-empty directory
    fs.rmdirSync(examplesPath);
    console.log(`✅ Examples directory deleted (${fileCount} files)\n`);

    return { deleted: deletedFiles, fileCount };
  } catch (error) {
    console.error(`❌ Error deleting examples directory:`, error.message);
    return { deleted: [], fileCount: 0 };
  }
}

/**
 * Clean up the entire API documentation directory
 */
function cleanupApiDirectory() {
  if (!fs.existsSync(apiDocsPath)) {
    console.log(
      "⚠️  API documentation directory not found - nothing to clean up"
    );
    return { deleted: false, fileCount: 0 };
  }

  console.log(
    `🗑️  Deleting entire API documentation directory: ${path.relative(
      process.cwd(),
      apiDocsPath
    )}`
  );

  try {
    // Count files recursively before deleting
    let fileCount = 0;
    function countFiles(dirPath) {
      const items = fs.readdirSync(dirPath);
      items.forEach((item) => {
        const itemPath = path.join(dirPath, item);
        const stat = fs.statSync(itemPath);
        if (stat.isFile()) {
          fileCount++;
          console.log(
            `   📄 Deleting file: ${path.relative(apiDocsPath, itemPath)}`
          );
        } else if (stat.isDirectory()) {
          countFiles(itemPath);
        }
      });
    }

    countFiles(apiDocsPath);

    // Delete the entire directory
    if (deleteDirectory(apiDocsPath)) {
      console.log(
        `✅ API documentation directory completely deleted (${fileCount} files)\n`
      );
      return { deleted: true, fileCount };
    } else {
      return { deleted: false, fileCount: 0 };
    }
  } catch (error) {
    console.error(
      `❌ Error deleting API documentation directory:`,
      error.message
    );
    return { deleted: false, fileCount: 0 };
  }
}

/**
 * Clean up image asset directories
 */
function cleanupImageAssets() {
  const results = { deletedDirectories: [], totalFiles: 0 };

  // Clean up docs-assets directory
  if (fs.existsSync(docsAssetsPath)) {
    console.log(
      `🗑️  Deleting docs-assets directory: ${path.relative(
        process.cwd(),
        docsAssetsPath
      )}`
    );

    try {
      const files = fs.readdirSync(docsAssetsPath);
      let fileCount = 0;

      files.forEach((file) => {
        const filePath = path.join(docsAssetsPath, file);
        const stat = fs.statSync(filePath);
        if (stat.isFile()) {
          console.log(`   📄 Deleting file: ${file}`);
          fs.unlinkSync(filePath);
          fileCount++;
        }
      });

      fs.rmdirSync(docsAssetsPath);
      console.log(`✅ docs-assets directory deleted (${fileCount} files)\n`);
      results.deletedDirectories.push("docs-assets");
      results.totalFiles += fileCount;
    } catch (error) {
      console.error(`❌ Error deleting docs-assets directory:`, error.message);
    }
  } else {
    console.log("⚠️  docs-assets directory not found - skipping");
  }

  // Clean up landing-assets directory
  if (fs.existsSync(landingAssetsPath)) {
    console.log(
      `🗑️  Deleting landing-assets directory: ${path.relative(
        process.cwd(),
        landingAssetsPath
      )}`
    );

    try {
      const files = fs.readdirSync(landingAssetsPath);
      let fileCount = 0;

      files.forEach((file) => {
        const filePath = path.join(landingAssetsPath, file);
        const stat = fs.statSync(filePath);
        if (stat.isFile()) {
          console.log(`   📄 Deleting file: ${file}`);
          fs.unlinkSync(filePath);
          fileCount++;
        }
      });

      fs.rmdirSync(landingAssetsPath);
      console.log(`✅ landing-assets directory deleted (${fileCount} files)\n`);
      results.deletedDirectories.push("landing-assets");
      results.totalFiles += fileCount;
    } catch (error) {
      console.error(
        `❌ Error deleting landing-assets directory:`,
        error.message
      );
    }
  } else {
    console.log("⚠️  landing-assets directory not found - skipping");
  }

  return results;
}

/**
 * Main cleanup function
 */
function cleanup() {
  try {
    // Validate we're in a TinaDocs project
    validateTinaDocsProject();

    // Clean up entire API documentation directory
    const { deleted: apiDeleted, fileCount: apiFileCount } =
      cleanupApiDirectory();

    // Clean up examples directory
    const { deleted: deletedExamples, fileCount: exampleFileCount } =
      cleanupExamplesDirectory();

    // Clean up image asset directories
    const { deletedDirectories: deletedImageDirs, totalFiles: imageFileCount } =
      cleanupImageAssets();

    // Update navigation
    const navigationUpdated = updateNavigation();

    // Summary
    console.log("🎉 Cleanup completed!\n");
    console.log("📊 Summary:");

    if (apiDeleted) {
      console.log(
        `• Deleted entire API documentation directory (${apiFileCount} files)`
      );
    } else {
      console.log("• No API documentation directory was deleted (none found)");
    }

    if (deletedExamples.length > 0) {
      console.log(
        `• Deleted examples: ${deletedExamples.join(
          ", "
        )} (${exampleFileCount} files)`
      );
    } else {
      console.log("• No examples were deleted (none found)");
    }

    if (deletedImageDirs.length > 0) {
      console.log(
        `• Deleted image directories: ${deletedImageDirs.join(
          ", "
        )} (${imageFileCount} files)`
      );
    } else {
      console.log("• No image directories were deleted (none found)");
    }

    if (navigationUpdated) {
      console.log("• Navigation updated successfully");
    } else {
      console.log("• Navigation update skipped or failed");
    }

    console.log("\n💡 Next steps:");
    console.log("   • Review the changes in your editor");
    console.log("   • Test your documentation site");
    console.log("   • Commit the changes to version control");
  } catch (error) {
    console.error("\n❌ Cleanup failed:", error.message);
    console.error("\n🔧 Troubleshooting:");
    console.error("   • Make sure you're in your TinaDocs project root");
    console.error("   • Check that you have write permissions");
    console.error("   • Ensure the content/ directory structure exists");
    process.exit(1);
  }
}

// Show help if requested
if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log("TinaDocs API Documentation Cleanup Script\n");
  console.log("Usage:");
  console.log("  pnpm run cleanup");
  console.log("\nOptions:");
  console.log("  --help, -h    Show this help message");
  console.log("\nDescription:");
  console.log(
    "  Removes auto-generated API documentation directories and example files"
  );
  console.log(
    "  Deletes the entire api-documentation directory, examples directory,"
  );
  console.log("  and docs-assets/landing-assets image directories.");
  console.log("  Also completely removes the API tab from navigation.");
  process.exit(0);
}

// Run the cleanup
cleanup();
