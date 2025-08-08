# TinaDocs Utility Scripts

This directory contains utility scripts to help you manage your TinaDocs project.

## API Documentation Cleanup

The `cleanup` script helps you clean up auto-generated API documentation while preserving manually created overview and example files.

### What it does

- ✅ **Completely deletes** the entire `api-documentation/` directory
- ✅ **Deletes** all example documentation files in `docs/examples/`
- ✅ **Deletes** image asset directories (`docs-assets/` and `landing-assets/`)
- ✅ **Completely removes** the API tab from navigation
- ✅ **Validates** that you're in a TinaDocs project before running

### Usage

```bash
pnpm run cleanup
```

### When to use this script

Use this script when you:
- Want to remove auto-generated API documentation from OpenAPI specs
- Need to clean up example documentation files
- Want to keep only the API overview documentation
- Are migrating from auto-generated to manual API docs
- Want to start fresh with a clean documentation structure

### What gets preserved

The script preserves:
- All other documentation outside the API and examples sections

### What gets removed

The script removes:
- The entire `content/docs/api-documentation/` directory and all its contents
- The entire `content/docs/examples/` directory and all its files
- The `public/img/docs-assets/` directory and all its images
- The `public/img/landing-assets/` directory and all its images
- The complete API tab from navigation

### Safety features

- ✅ Validates TinaDocs project structure before running
- ✅ Shows what will be deleted and preserves important files
- ✅ Preserves all non-directory files in the API documentation root
- ✅ Updates navigation safely without breaking other tabs
- ✅ Provides detailed success/error messages

### Example output

```
🧹 TinaDocs API Documentation Cleanup

✅ TinaDocs project detected

🗑️  Deleting directory: content/docs/api-documentation/pet
   📄 Deleting file: get-pet-findbystatus.mdx
   📄 Deleting file: post-pet.mdx
   (... more files)
✅ Directory deleted: pet (6 files)

📝 Updating navigation...
   🔍 Found API tab with 3 menu groups
   🗑️  Removed 2 API reference groups
   ✅ Kept 1 document groups
✅ Navigation updated successfully

🎉 Cleanup completed!

📊 Summary:
• Deleted entire API documentation directory (1 files)
• Deleted examples: pet-store-all-routes.mdx, library-api-example.mdx, internal-document-example.mdx (3 files)
• Deleted image directories: docs-assets, landing-assets (31 files)
• Navigation updated successfully
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

### After running the script

1. Review the changes in your editor
2. Test your documentation site with `pnpm run dev`
3. Commit the changes to version control
4. Update any links or references to the deleted documentation

---

For more TinaDocs utilities and documentation, visit [TinaDocs GitHub](https://github.com/tinacms/tina-docs).