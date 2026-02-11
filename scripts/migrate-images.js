#!/usr/bin/env node

/**
 * TinaDocs Image Migration Script
 *
 * This script migrates images in MDX content to the new ImageMetadata format
 * by loading each image and capturing its dimensions.
 *
 * Usage:
 *   node scripts/migrate-images.js
 *   or
 *   pnpm run migrate-images
 *
 * What it does:
 * 1. Scans all MDX files in content/docs/
 * 2. Finds accordion and scrollShowcase blocks with image fields
 * 3. Loads each image to get its dimensions
 * 4. Converts string image paths to ImageMetadata objects with width/height
 * 5. Updates the MDX files with the new format
 * 6. Creates a backup of each file before modifying
 */

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

// ANSI color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

console.log(
  `${colors.bright}${colors.cyan}🖼️  TinaDocs Image Migration${colors.reset}\n`
);

// Project root directory
const projectRoot = path.resolve(__dirname, "..");
const contentDir = path.join(projectRoot, "content", "docs");
const publicDir = path.join(projectRoot, "public");

/**
 * Get image dimensions from a file path or URL
 */
async function getImageDimensions(imagePath) {
  return new Promise((resolve, reject) => {
    // Check if it's a URL
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      const client = imagePath.startsWith("https://") ? https : http;

      client
        .get(imagePath, (response) => {
          const chunks = [];
          response.on("data", (chunk) => chunks.push(chunk));
          response.on("end", () => {
            try {
              const buffer = Buffer.concat(chunks);
              const dimensions = getImageDimensionsFromBuffer(buffer);
              resolve(dimensions);
            } catch (error) {
              reject(error);
            }
          });
        })
        .on("error", reject);
    } else {
      // Local file path
      const fullPath = imagePath.startsWith("/")
        ? path.join(publicDir, imagePath)
        : path.join(contentDir, imagePath);

      if (!fs.existsSync(fullPath)) {
        reject(new Error(`Image file not found: ${fullPath}`));
        return;
      }

      try {
        const buffer = fs.readFileSync(fullPath);
        const dimensions = getImageDimensionsFromBuffer(buffer);
        resolve(dimensions);
      } catch (error) {
        reject(error);
      }
    }
  });
}

/**
 * Extract image dimensions from buffer (supports PNG, JPEG, GIF, WebP)
 */
function getImageDimensionsFromBuffer(buffer) {
  // PNG
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return {
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20),
    };
  }

  // JPEG
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset < buffer.length) {
      if (buffer[offset] !== 0xff) break;

      const marker = buffer[offset + 1];
      if (marker === 0xc0 || marker === 0xc2) {
        return {
          height: buffer.readUInt16BE(offset + 5),
          width: buffer.readUInt16BE(offset + 7),
        };
      }

      offset += 2 + buffer.readUInt16BE(offset + 2);
    }
  }

  // GIF
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
    return {
      width: buffer.readUInt16LE(6),
      height: buffer.readUInt16LE(8),
    };
  }

  // WebP
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46
  ) {
    // Simple WebP
    if (
      buffer[12] === 0x56 &&
      buffer[13] === 0x50 &&
      buffer[14] === 0x38 &&
      buffer[15] === 0x20
    ) {
      return {
        width: buffer.readUInt16LE(26) & 0x3fff,
        height: buffer.readUInt16LE(28) & 0x3fff,
      };
    }
    // Lossless WebP
    if (
      buffer[12] === 0x56 &&
      buffer[13] === 0x50 &&
      buffer[14] === 0x38 &&
      buffer[15] === 0x4c
    ) {
      const bits = buffer.readUInt32LE(21);
      return {
        width: (bits & 0x3fff) + 1,
        height: ((bits >> 14) & 0x3fff) + 1,
      };
    }
  }

  throw new Error("Unsupported image format");
}

/**
 * Find all MDX files recursively
 */
function findMdxFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...findMdxFiles(fullPath));
    } else if (item.endsWith(".mdx")) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Parse and migrate image fields in MDX content
 */
async function migrateImagesInFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  let modified = false;
  let newContent = content;
  const migrations = [];

  // Match accordion blocks with image fields
  const accordionRegex = /<accordion\s+([^>]*?)>/gs;
  const matches = [...content.matchAll(accordionRegex)];

  for (const match of matches) {
    const blockContent = match[1];

    // Check if this block has an image field that's a simple string
    const imageMatch = blockContent.match(/image=["']([^"']+)["']/);

    if (imageMatch) {
      const imagePath = imageMatch[1];

      try {
        console.log(`  📷 Found accordion image: ${imagePath}`);
        const dimensions = await getImageDimensions(imagePath);

        // Create the new object format
        const newImageValue = `image={{
      src: "${imagePath}",
      width: ${dimensions.width},
      height: ${dimensions.height},
      alt: ""
    }}`;

        // Replace the old format with the new one
        const oldImageValue = `image="${imagePath}"`;
        newContent = newContent.replace(oldImageValue, newImageValue);

        modified = true;
        migrations.push({
          path: imagePath,
          dimensions,
          type: "accordion",
        });

        console.log(`  ✅ Migrated: ${dimensions.width}x${dimensions.height}`);
      } catch (error) {
        console.log(
          `  ${colors.yellow}⚠️  Could not load image: ${error.message}${colors.reset}`
        );
      }
    }
  }

  // Match scrollShowcase blocks with showcaseItems
  const showcaseRegex = /<scrollShowcase\s+showcaseItems=\{(\[[\s\S]*?\])\}/gs;
  const showcaseMatches = [...content.matchAll(showcaseRegex)];

  for (const match of showcaseMatches) {
    const itemsContent = match[1];

    // Find image strings within the items array
    const imageMatches = [
      ...itemsContent.matchAll(/image:\s*["']([^"']+)["']/g),
    ];

    for (const imageMatch of imageMatches) {
      const imagePath = imageMatch[1];

      try {
        console.log(`  📷 Found showcase image: ${imagePath}`);
        const dimensions = await getImageDimensions(imagePath);

        // Create the new object format
        const newImageValue = `image: {
          src: "${imagePath}",
          width: ${dimensions.width},
          height: ${dimensions.height},
          alt: ""
        }`;

        // Replace the old format with the new one
        const oldImageValue = `image: "${imagePath}"`;
        newContent = newContent.replace(oldImageValue, newImageValue);

        modified = true;
        migrations.push({
          path: imagePath,
          dimensions,
          type: "scrollShowcase",
        });

        console.log(`  ✅ Migrated: ${dimensions.width}x${dimensions.height}`);
      } catch (error) {
        console.log(
          `  ${colors.yellow}⚠️  Could not load image: ${error.message}${colors.reset}`
        );
      }
    }
  }

  // Match inline markdown images: ![alt](path "caption")
  const inlineImageRegex = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/g;
  const inlineMatches = [...content.matchAll(inlineImageRegex)];

  for (const match of inlineMatches) {
    const [fullMatch, alt, imagePath, caption] = match;

    try {
      console.log(`  📷 Found inline image: ${imagePath}`);
      const dimensions = await getImageDimensions(imagePath);

      // Create the preloadedImage component
      const preloadedImageBlock = `<preloadedImage
  image={{
    src: "${imagePath}",
    width: ${dimensions.width},
    height: ${dimensions.height},
    alt: "${alt || ""}"
  }}${caption ? `\n  caption="${caption}"` : ""}
/>`;

      // Replace the markdown image with the component
      newContent = newContent.replace(fullMatch, preloadedImageBlock);

      modified = true;
      migrations.push({
        path: imagePath,
        dimensions,
        type: "inline",
      });

      console.log(
        `  ✅ Migrated to preloadedImage: ${dimensions.width}x${dimensions.height}`
      );
    } catch (error) {
      console.log(
        `  ${colors.yellow}⚠️  Could not load inline image: ${error.message}${colors.reset}`
      );
    }
  }

  return { modified, newContent, migrations };
}

/**
 * Create a backup of a file
 */
function createBackup(filePath) {
  const backupPath = `${filePath}.backup`;
  fs.copyFileSync(filePath, backupPath);
  return backupPath;
}

/**
 * Main migration function
 */
async function migrate() {
  try {
    console.log(`${colors.bright}Scanning for MDX files...${colors.reset}\n`);

    const mdxFiles = findMdxFiles(contentDir);
    console.log(`Found ${mdxFiles.length} MDX files\n`);

    let totalMigrations = 0;
    let filesModified = 0;

    for (const filePath of mdxFiles) {
      const relativePath = path.relative(projectRoot, filePath);
      console.log(`${colors.bright}Processing: ${relativePath}${colors.reset}`);

      const { modified, newContent, migrations } =
        await migrateImagesInFile(filePath);

      if (modified) {
        // Create backup
        const backupPath = createBackup(filePath);
        console.log(`  💾 Backup created: ${path.basename(backupPath)}`);

        // Write the new content
        fs.writeFileSync(filePath, newContent, "utf8");
        console.log(
          `  ${colors.green}✅ Updated with ${migrations.length} image(s)${colors.reset}`
        );

        filesModified++;
        totalMigrations += migrations.length;
      } else {
        console.log(`  ⏭️  No images to migrate`);
      }

      console.log(); // Empty line for readability
    }

    // Summary
    console.log(
      `${colors.bright}${colors.green}🎉 Migration completed!${colors.reset}\n`
    );
    console.log(`${colors.bright}📊 Summary:${colors.reset}`);
    console.log(`  • Files scanned: ${mdxFiles.length}`);
    console.log(`  • Files modified: ${filesModified}`);
    console.log(`  • Images migrated: ${totalMigrations}`);

    if (filesModified > 0) {
      console.log(
        `\n${colors.yellow}💡 Tip: Backup files (.backup) have been created. You can delete them once you've verified the migration.${colors.reset}`
      );
    }
  } catch (error) {
    console.error(
      `${colors.red}❌ Migration failed: ${error.message}${colors.reset}`
    );
    console.error(error.stack);
    process.exit(1);
  }
}

// Show help if requested
if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log("TinaDocs Image Migration Script\n");
  console.log("Usage:");
  console.log("  node scripts/migrate-images.js");
  console.log("  or");
  console.log("  pnpm run migrate-images");
  console.log("\nOptions:");
  console.log("  --help, -h    Show this help message");
  console.log("\nDescription:");
  console.log("  Migrates image fields in accordion and scrollShowcase blocks");
  console.log(
    "  from simple string paths to ImageMetadata objects with dimensions."
  );
  console.log("  Creates backups of all modified files.");
  process.exit(0);
}

// Run the migration
(async () => {
  await migrate();
})();
