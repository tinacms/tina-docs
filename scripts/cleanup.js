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
 * 1. Deletes all directories within content/docs/ (preserves only index.mdx)
 * 2. Deletes docs-assets and landing-assets image folders
 * 3. Cleans up navigation to only show the main index page
 * 4. Provides a completely clean documentation slate
 */

const fs = require("fs");
const path = require("path");

console.log("🧹 TinaDocs API Documentation Cleanup\n");

// Paths (relative to project root)
const docsPath = path.join(process.cwd(), "content/docs");
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
 * Update navigation to clean up all references to deleted directories
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

    let updatesCount = 0;

    // Remove API tab completely
    const originalTabCount = navigationData.tabs?.length || 0;
    if (navigationData.tabs) {
      navigationData.tabs = navigationData.tabs.filter(
        (tab) => tab.title !== "API"
      );
    }
    const apiTabsRemoved =
      originalTabCount - (navigationData.tabs?.length || 0);
    updatesCount += apiTabsRemoved;

    // Clean up Docs tab - remove all groups except Introduction with only index.mdx
    const docsTab = navigationData.tabs?.find((tab) => tab.title === "Docs");
    if (docsTab && docsTab.supermenuGroup) {
      console.log(
        `   🔍 Found Docs tab with ${docsTab.supermenuGroup.length} menu groups`
      );

      // Keep only Introduction group with only index.mdx
      const originalGroupCount = docsTab.supermenuGroup.length;
      docsTab.supermenuGroup = [
        {
          title: "Introduction",
          items: [
            {
              slug: "content/docs/index.mdx",
              _template: "item",
            },
          ],
        },
      ];

      const removedGroups = originalGroupCount - docsTab.supermenuGroup.length;
      updatesCount += removedGroups;

      console.log(
        `   🗑️  Cleaned up Docs navigation (removed ${removedGroups} groups)`
      );
      console.log(`   ✅ Navigation now only shows index.mdx`);
    }

    if (updatesCount > 0) {
      if (apiTabsRemoved > 0) {
        console.log(`   🗑️  Completely removed API tab from navigation`);
      }

      // Write back to file
      fs.writeFileSync(navigationPath, JSON.stringify(navigationData, null, 2));
      console.log("✅ Navigation updated successfully\n");
    } else {
      console.log("   ℹ️  No navigation updates needed\n");
    }

    return true;
  } catch (error) {
    console.error("❌ Error updating navigation:", error.message);
    return false;
  }
}

/**
 * Clean up all directories within content/docs/ while preserving index.mdx
 */
function cleanupDocsDirectories() {
  if (!fs.existsSync(docsPath)) {
    console.log("⚠️  Docs directory not found - nothing to clean up");
    return { deletedDirectories: [], totalFiles: 0 };
  }

  console.log("🗑️  Cleaning up docs directories (preserving index.mdx)...\n");

  const results = { deletedDirectories: [], totalFiles: 0 };

  try {
    const items = fs.readdirSync(docsPath);

    items.forEach((item) => {
      const itemPath = path.join(docsPath, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        console.log(
          `🗑️  Deleting directory: ${path.relative(process.cwd(), itemPath)}`
        );

        // Count files in this directory recursively
        let fileCount = 0;
        function countFiles(dirPath) {
          try {
            const dirItems = fs.readdirSync(dirPath);
            dirItems.forEach((dirItem) => {
              const dirItemPath = path.join(dirPath, dirItem);
              const dirItemStat = fs.statSync(dirItemPath);
              if (dirItemStat.isFile()) {
                fileCount++;
                console.log(
                  `   📄 Deleting file: ${path.relative(itemPath, dirItemPath)}`
                );
              } else if (dirItemStat.isDirectory()) {
                countFiles(dirItemPath);
              }
            });
          } catch (error) {
            console.error(
              `   ⚠️  Error reading directory ${dirPath}:`,
              error.message
            );
          }
        }

        countFiles(itemPath);

        // Delete the directory
        if (deleteDirectory(itemPath)) {
          console.log(`✅ Directory deleted: ${item} (${fileCount} files)\n`);
          results.deletedDirectories.push(item);
          results.totalFiles += fileCount;
        }
      } else if (stat.isFile() && item !== "index.mdx") {
        // Delete any other files in docs root (but preserve index.mdx)
        console.log(`🗑️  Deleting file: ${item}`);
        fs.unlinkSync(itemPath);
        console.log(`✅ File deleted: ${item}\n`);
        results.totalFiles += 1;
      } else if (item === "index.mdx") {
        console.log(`✅ Preserving: ${item}`);
      }
    });

    return results;
  } catch (error) {
    console.error(`❌ Error cleaning up docs directories:`, error.message);
    return { deletedDirectories: [], totalFiles: 0 };
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

    // Clean up all docs directories (preserve only index.mdx)
    const { deletedDirectories: deletedDocs, totalFiles: docsFileCount } =
      cleanupDocsDirectories();

    // Clean up image asset directories
    const { deletedDirectories: deletedImageDirs, totalFiles: imageFileCount } =
      cleanupImageAssets();

    // Update navigation
    const navigationUpdated = updateNavigation();

    // Summary
    console.log("🎉 Cleanup completed!\n");
    console.log("📊 Summary:");

    if (deletedDocs.length > 0) {
      console.log(
        `• Deleted docs directories: ${deletedDocs.join(
          ", "
        )} (${docsFileCount} files)`
      );
    } else {
      console.log("• No docs directories were deleted (none found)");
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
    "  Removes all documentation directories while preserving index.mdx"
  );
  console.log(
    "  Deletes all folders in content/docs/ and image asset directories."
  );
  console.log("  Also cleans up navigation to only show the main index page.");
  process.exit(0);
}

// Run the cleanup
cleanup();
