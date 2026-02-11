#!/usr/bin/env node

/**
 * TinaDocs Backup Cleanup Script
 *
 * This script removes all .backup files created by the migrate-images script.
 *
 * Usage:
 *   node scripts/cleanup-backups.js
 *   or
 *   pnpm run cleanup-backups
 *
 * What it does:
 * 1. Scans all directories in content/docs/
 * 2. Finds all .backup files
 * 3. Lists them for review
 * 4. Asks for confirmation before deletion
 * 5. Deletes all backup files
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

// ANSI color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

console.log(
  `${colors.bright}${colors.cyan}🧹 TinaDocs Backup Cleanup${colors.reset}\n`
);

// Project root directory
const projectRoot = path.resolve(__dirname, "..");
const contentDir = path.join(projectRoot, "content", "docs");

/**
 * Find all .backup files recursively
 */
function findBackupFiles(dir) {
  const backups = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      backups.push(...findBackupFiles(fullPath));
    } else if (item.endsWith(".backup")) {
      backups.push(fullPath);
    }
  }

  return backups;
}

/**
 * Ask for user confirmation
 */
async function askForConfirmation(backupCount) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    console.log(
      `${colors.yellow}⚠️  Found ${backupCount} backup file(s)${colors.reset}\n`
    );
    console.log("Do you want to delete these files?");
    console.log("  Type 'yes' or 'y' to continue");
    console.log("  Type 'no' or 'n' to cancel\n");

    rl.question(`${colors.bright}👉 Your choice (yes/no): ${colors.reset}`, (answer) => {
      rl.close();
      const normalized = answer.toLowerCase().trim();
      resolve(normalized === "yes" || normalized === "y");
    });
  });
}

/**
 * Delete backup files
 */
function deleteBackups(backupFiles) {
  let deletedCount = 0;
  let errorCount = 0;

  for (const filePath of backupFiles) {
    try {
      fs.unlinkSync(filePath);
      const relativePath = path.relative(projectRoot, filePath);
      console.log(`  ${colors.green}✅ Deleted: ${relativePath}${colors.reset}`);
      deletedCount++;
    } catch (error) {
      const relativePath = path.relative(projectRoot, filePath);
      console.log(
        `  ${colors.red}❌ Failed to delete: ${relativePath}${colors.reset}`
      );
      console.log(`     Error: ${error.message}`);
      errorCount++;
    }
  }

  return { deletedCount, errorCount };
}

/**
 * Main cleanup function
 */
async function cleanup() {
  try {
    console.log(`${colors.bright}Scanning for backup files...${colors.reset}\n`);

    if (!fs.existsSync(contentDir)) {
      console.log(
        `${colors.red}❌ Content directory not found: ${contentDir}${colors.reset}`
      );
      process.exit(1);
    }

    const backupFiles = findBackupFiles(contentDir);

    if (backupFiles.length === 0) {
      console.log(
        `${colors.green}✅ No backup files found. Nothing to clean up!${colors.reset}`
      );
      process.exit(0);
    }

    // List all backup files
    console.log(`${colors.bright}Backup files found:${colors.reset}`);
    for (const filePath of backupFiles) {
      const relativePath = path.relative(projectRoot, filePath);
      const stat = fs.statSync(filePath);
      const sizeKB = (stat.size / 1024).toFixed(2);
      console.log(`  • ${relativePath} (${sizeKB} KB)`);
    }
    console.log();

    // Ask for confirmation
    const shouldProceed = await askForConfirmation(backupFiles.length);

    if (!shouldProceed) {
      console.log(
        `\n${colors.yellow}⏭️  Cleanup cancelled. No files were deleted.${colors.reset}`
      );
      process.exit(0);
    }

    console.log(`\n${colors.bright}Deleting backup files...${colors.reset}\n`);

    const { deletedCount, errorCount } = deleteBackups(backupFiles);

    // Summary
    console.log(
      `\n${colors.bright}${colors.green}🎉 Cleanup completed!${colors.reset}\n`
    );
    console.log(`${colors.bright}📊 Summary:${colors.reset}`);
    console.log(`  • Backup files found: ${backupFiles.length}`);
    console.log(`  • Successfully deleted: ${deletedCount}`);
    if (errorCount > 0) {
      console.log(`  • Failed to delete: ${errorCount}`);
    }
  } catch (error) {
    console.error(
      `${colors.red}❌ Cleanup failed: ${error.message}${colors.reset}`
    );
    console.error(error.stack);
    process.exit(1);
  }
}

// Show help if requested
if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log("TinaDocs Backup Cleanup Script\n");
  console.log("Usage:");
  console.log("  node scripts/cleanup-backups.js");
  console.log("  or");
  console.log("  pnpm run cleanup-backups");
  console.log("\nOptions:");
  console.log("  --help, -h    Show this help message");
  console.log("\nDescription:");
  console.log("  Removes all .backup files created by the migrate-images script.");
  console.log("  Lists all backup files and asks for confirmation before deletion.");
  process.exit(0);
}

// Run the cleanup
(async () => {
  await cleanup();
})();
