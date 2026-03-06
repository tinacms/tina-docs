# TinaDocs Utility Scripts

This directory contains utility scripts to help you manage your TinaDocs project.

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
   📄 Deleting file: overview.mdx
   📄 Deleting file: pet/get-pet-findbystatus.mdx
   (... more files)
✅ Directory deleted: api-documentation (9 files)

📄 Cleaning API schema files...
   🗑️  Deleted: Swagger-Petstore.json
   🗑️  Deleted: spec.json
   ✅ Cleaned up 2 API schema file(s)

🗑️  Deleting docs-assets directory: public/img/docs-assets
   📄 Deleting file: api-spec-upload.png
   (... more files)
✅ docs-assets directory deleted (27 files)

🗂️  Cleaning Next.js cache...
   ✅ Deleted .next cache directory (1346 files)

📝 Updating navigation...
   🔍 Found Docs tab with 4 menu groups
   🗑️  Cleaned up Docs navigation (removed 3 groups)
   ✅ Navigation now only shows index.mdx
   🗑️  Completely removed API tab from navigation
✅ Navigation updated successfully

🎉 Cleanup completed!

📊 Summary:
• Deleted docs directories: api-documentation, examples, going-live, introduction, tinadocs-features, using-tinacms (31 files)
• Deleted API schema files: 2 files
• Deleted image directories: docs-assets, landing-assets (31 files)
• Navigation updated successfully
• Next.js cache cleared successfully

💡 Next steps:
   • Review the changes in your editor
   • Restart your dev server: pnpm dev
   • Test your documentation site
   • Commit the changes to version control
```

### Troubleshooting

If you encounter issues:

1. **"This doesn't appear to be a TinaDocs project"**
   - Make sure you're running the script from your project root
   - Verify you have `content/docs/` and `tina/` directories

2. **"Navigation update failed"**
   - Check that `content/navigation-bar/docs-navigation-bar.json` exists
   - Ensure the file is valid JSON

3. **Permission errors**
   - Make sure you have write permissions to the project directory
   - Check permissions for `content/`, `public/`, and `.next` directories

4. **"API schema directory not found"**
   - This is normal if your project doesn't have API schema files
   - The script will skip this step safely

### After running the script

1. Review the changes in your editor
2. **Restart your dev server**: `pnpm dev` (required to clear Next.js cache)
3. Test your documentation site
4. Commit the changes to version control
5. Update any links or references to the deleted documentation

> **Important:** You must restart your development server after running cleanup to ensure Next.js rebuilds the site without cached references to deleted pages.

---

For more TinaDocs utilities and documentation, visit [TinaDocs GitHub](https://github.com/tinacms/tina-docs).