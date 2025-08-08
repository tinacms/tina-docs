# TinaDocs Utility Scripts

This directory contains utility scripts to help you manage your TinaDocs project.

## Documentation Reset

The `cleanup` script provides a complete documentation reset, removing all content directories while preserving only the main index page.

### What it does

- ✅ **Deletes all directories** within `content/docs/` (preserves only `index.mdx`)
- ✅ **Deletes** image asset directories (`docs-assets/` and `landing-assets/`)
- ✅ **Completely removes** the API tab from navigation
- ✅ **Provides** a completely clean documentation slate
- ✅ **Validates** that you're in a TinaDocs project before running

### Usage

```bash
pnpm run cleanup
```

### When to use this script

Use this script when you:
- Want to completely reset your documentation structure
- Need to remove all existing content and start fresh
- Are setting up a new project from the TinaDocs template
- Want to clear out example/demo content
- Need a clean slate for new documentation

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
• Deleted docs directories: api-documentation, examples, tinadocs-features, using-tinacms, introduction, going-live (85+ files)
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