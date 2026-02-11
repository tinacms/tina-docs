# TinaDocs Utility Scripts

This directory contains utility scripts to help you manage your TinaDocs project.

## Image Migration

The `migrate-images` script automatically migrates images in your MDX content to the new ImageMetadata format with dimensions.

### What it does

- ✅ **Scans all MDX files** in `content/docs/`
- ✅ **Finds accordion and scrollShowcase blocks** with image fields
- ✅ **Converts inline markdown images** to preloaded image components
- ✅ **Loads each image** to get its actual dimensions
- ✅ **Converts string image paths** to ImageMetadata objects with width/height
- ✅ **Creates backups** of all modified files (`.backup` extension)
- ✅ **Supports multiple formats**: PNG, JPEG, GIF, WebP
- ✅ **Handles both local and remote images**

### Usage

```bash
pnpm run migrate-images
```

### What gets migrated

The script migrates three types of images:

#### 1. Accordion blocks
**Before:**
```jsx
<accordion
  image="/img/example.png"
  title="Example"
/>
```

**After:**
```jsx
<accordion
  image={{
    src: "/img/example.png",
    width: 1200,
    height: 800,
    alt: ""
  }}
  title="Example"
/>
```

#### 2. ScrollShowcase blocks
**Before:**
```jsx
<scrollShowcase showcaseItems={[
  {
    title: "Example",
    image: "/img/example.png"
  }
]} />
```

**After:**
```jsx
<scrollShowcase showcaseItems={[
  {
    title: "Example",
    image: {
      src: "/img/example.png",
      width: 1920,
      height: 1080,
      alt: ""
    }
  }
]} />
```

#### 3. Inline markdown images
**Before:**
```markdown
![Alt text](/img/example.png "Caption text")
```

**After:**
```jsx
<preloadedImage
  image={{
    src: "/img/example.png",
    width: 1920,
    height: 1080,
    alt: "Alt text"
  }}
  caption="Caption text"
/>
```

This converts regular markdown images to optimized preloaded images that prevent layout shift and improve Core Web Vitals.

### Safety features

- ✅ Creates `.backup` files before modifying
- ✅ Preserves original file if no images found
- ✅ Handles errors gracefully (skips problematic images)
- ✅ Provides detailed progress and summary
- ✅ Non-destructive (backups can be restored)

### Example output

```
🖼️  TinaDocs Image Migration

Scanning for MDX files...

Found 15 MDX files

Processing: content/docs/introduction/showcase.mdx
  📷 Found showcase image: /img/docs-assets/showcase-example-1.png
  ✅ Migrated: 1920x1080
  📷 Found showcase image: /img/docs-assets/showcase-example-2.png
  ✅ Migrated: 1920x1080
  💾 Backup created: showcase.mdx.backup
  ✅ Updated with 2 image(s)

Processing: content/docs/getting-started.mdx
  📷 Found inline image: /img/docs-assets/setup.png
  ✅ Migrated to preloadedImage: 1600x900
  📷 Found accordion image: /img/example.jpg
  ✅ Migrated: 1200x800
  💾 Backup created: getting-started.mdx.backup
  ✅ Updated with 2 image(s)

🎉 Migration completed!

📊 Summary:
  • Files scanned: 15
  • Files modified: 3
  • Images migrated: 7

💡 Tip: Backup files (.backup) have been created. You can delete them once you've verified the migration.
```

### After migration

1. Review the changes in your MDX files
2. Test your site to ensure images display correctly
3. Delete `.backup` files using the cleanup script (see below)
4. Commit the changes to version control

---

## Backup Cleanup

The `cleanup-backups` script removes all `.backup` files created by the image migration script.

### What it does

- ✅ **Scans for backup files** in `content/docs/`
- ✅ **Lists all backups** with file sizes
- ✅ **Asks for confirmation** before deletion
- ✅ **Safely removes** backup files
- ✅ **Provides summary** of deleted files

### Usage

```bash
pnpm run cleanup-backups
```

### Safety features

- ✅ Lists all files before deletion
- ✅ Shows file sizes for review
- ✅ Requires explicit confirmation
- ✅ Handles errors gracefully
- ✅ Provides detailed summary

### Example output

```
🧹 TinaDocs Backup Cleanup

Scanning for backup files...

Backup files found:
  • content/docs/introduction/showcase.mdx.backup (12.45 KB)
  • content/docs/getting-started.mdx.backup (8.32 KB)

⚠️  Found 2 backup file(s)

Do you want to delete these files?
  Type 'yes' or 'y' to continue
  Type 'no' or 'n' to cancel

👉 Your choice (yes/no): yes

Deleting backup files...

  ✅ Deleted: content/docs/introduction/showcase.mdx.backup
  ✅ Deleted: content/docs/getting-started.mdx.backup

🎉 Cleanup completed!

📊 Summary:
  • Backup files found: 2
  • Successfully deleted: 2
```

### When to use

- After verifying migrated images work correctly
- Before committing changes to version control
- To clean up your repository
- When you're confident the migration was successful

---

## Documentation Reset

The `cleanup` script provides a complete documentation reset, removing all content directories while preserving only the main index page.

### What it does

- ✅ **Deletes all directories** within `content/docs/` (preserves only `index.mdx`)
- ✅ **Deletes all API schema files** in `content/apiSchema/` (spec files, swagger files, etc.)
- ✅ **Deletes** image asset directories (`docs-assets/` and `landing-assets/`)
- ✅ **Clears Next.js cache** (`.next` folder) to prevent stale page references
- ✅ **Completely removes** the API tab from navigation
- ✅ **Provides** a completely clean documentation slate
- ✅ **Validates** that you're in a TinaDocs project before running
- ✅ **Requires interactive confirmation** - asks for explicit "yes" to proceed

### Usage

```bash
pnpm run cleanup
```

> **🚨 CRITICAL WARNING - READ BEFORE RUNNING:**
> 
> **This script PERMANENTLY DELETES all documentation content and cannot be undone.**
> 
> ❌ **DO NOT RUN if you've already made changes** - it will DELETE your work
> ✅ **DO RUN FIRST** if you want a clean slate, then make your changes
> ✅ **COMMIT TO GIT** before running if you want to preserve existing changes
> 
> **This action is irreversible unless you have version control backups.**

### When to use this script

Use this script when you:
- Want to completely reset your documentation structure **BEFORE making any changes**
- Need to remove all existing content and start fresh **from the beginning**
- Are setting up a new project from the TinaDocs template **as your first step**
- Want to clear out example/demo content **before adding your own**
- Need a clean slate for new documentation **at project start**

### When NOT to use this script

❌ **DO NOT USE** if you have:
- Already written your own documentation content
- Made customizations to the example files
- Added your own pages or sections
- Started working on your documentation project

⚠️ **Use with extreme caution** if you have made ANY changes to the documentation.

### What gets preserved

The script preserves:
- `content/docs/index.mdx` (main landing page)
- All other files outside the docs directory

### What gets removed

The script removes:
- ALL directories within `content/docs/` including:
  - `api-documentation/` 
  - `examples/`
  - `tinadocs-features/`
  - `using-tinacms/`
  - `introduction/`
  - `going-live/`
- ALL files in `content/apiSchema/` directory:
  - `spec.json`
  - `Swagger-Petstore.json`
  - Any other API schema files
- The `public/img/docs-assets/` directory and all its images
- The `public/img/landing-assets/` directory and all its images
- The `.next` cache directory (prevents stale page references)
- The complete API tab from navigation

### Safety features

- ✅ Validates TinaDocs project structure before running
- ✅ Shows what will be deleted and preserves important files
- ✅ Preserves `content/docs/index.mdx` (main landing page)
- ✅ Handles missing directories gracefully (skips if not found)
- ✅ Updates navigation safely without breaking other tabs
- ✅ Clears Next.js cache to prevent stale page references
- ✅ Provides detailed success/error messages with file counts

### Example output

```
🧹 TinaDocs API Documentation Cleanup

🚨 WARNING: This will PERMANENTLY DELETE all documentation content!
   - All directories in content/docs/ (except index.mdx)
   - All API schema files
   - All image assets
   - Navigation links
   - Next.js cache

❌ If you've made changes, they will be DELETED!
✅ Only run this if you want a completely clean slate.

✅ TinaDocs project detected

🔍 Do you want to proceed with the cleanup?
   Type 'yes' or 'y' to continue
   Type 'no' or 'n' to cancel

👉 Your choice (yes/no): yes

✅ Proceeding with cleanup...

🗑️  Cleaning up docs directories (preserving index.mdx)...
🗑️  Deleting directory: content/docs/api-documentation
   ✅ Deleted 8 files

🎉 Cleanup completed!

📊 Summary:
• Deleted docs directories: api-documentation, examples, tinadocs-features (45 files)
• Deleted API schema files: 2 files
• Deleted image directories: docs-assets, landing-assets (31 files)
• Navigation updated successfully
• Next.js cache cleared
• Index page rewritten with clean slate instructions

✅ Your TinaDocs project is now ready for fresh content!
```
