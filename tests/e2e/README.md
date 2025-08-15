# Search Functionality Tests

This directory contains Playwright end-to-end tests for the search functionality in TinaDocs.

## Overview

The search tests verify that the Pagefind-based search functionality works correctly across different scenarios:

- Basic search functionality
- Search result display
- Navigation to search results
- Mobile responsiveness
- Performance testing
- Error handling

## Test Files

- `search.spec.ts` - Comprehensive search tests with detailed scenarios
- `search-simplified.spec.ts` - Simplified tests using helper utilities
- `utils/search-helpers.ts` - Helper functions for search testing

## Running Tests

### Local Development

1. **Start the development server:**
   ```bash
   pnpm dev
   ```

2. **Run tests with UI (for debugging):**
   ```bash
   pnpm test:ui
   ```

### Preview/Production Testing

1. **Test against a specific URL:**
   ```bash
   PREVIEW_URL=https://your-preview-url.com pnpm test
   ```

2. **Run all tests:**
   ```bash
   pnpm test
   ```

## Test Scenarios

### Basic Functionality
- ✅ Search input field is visible
- ✅ Search returns results for existing content
- ✅ Search shows "No Llamas Found" for non-existent content
- ✅ Search clears when clicking outside
- ✅ Empty search input is handled gracefully
- ✅ Multiple rapid searches work correctly

### Technical Verification
- ✅ Pagefind files are accessible (`/_next/static/pagefind/`)
- ✅ Search completes within reasonable time (< 3 seconds)
- ✅ Mobile viewport works correctly

### Performance
- ✅ Search performance is measured and reported

## GitHub Actions Integration

The tests are automatically run in GitHub Actions on:

1. **Pull Requests** - Tests run against Vercel preview deployments
2. **Manual Workflow** - Can test against any preview URL

## Configuration

### Environment Variables

- `BASE_URL` - Base URL for testing (defaults to `http://localhost:3000`)
- `PREVIEW_URL` - Preview URL for testing

### Playwright Configuration

See `playwright.config.ts` for:
- Browser configurations (Chrome)
- Test timeouts and retries
- Screenshot and video capture settings
- Report generation

## Debugging

### View Test Reports

After running tests, view the HTML report:
```bash
npx playwright show-report
```

### Debug Individual Tests

1. Add `test.only()` to run a single test
2. Use `--debug` flag for step-by-step debugging
3. Use `--headed` to see the browser in action

### Common Issues

1. **Search not working locally:**
   - Ensure Pagefind index is generated: `pnpm build-local-pagefind`
   - Check if `/_next/static/pagefind/` files exist

2. **Tests timing out:**
   - Increase timeout in `playwright.config.ts`
   - Check if the server is running and accessible

3. **Search results not appearing:**
   - Verify search input selector matches the actual component
   - Check if Pagefind files are being served correctly

## Test Data

The tests use predefined search terms that should exist in your documentation:

```typescript
const KNOWN_CONTENT = {
  searchTerms: [
    'TinaDocs',
    'documentation', 
    'search',
    'API',
    'TinaCMS',
    'deployment',
    'theming',
    'components'
  ]
};
```

**Important:** Update these terms based on your actual content to ensure tests pass reliably.

## Contributing

When adding new search features:

1. Add corresponding tests to `search.spec.ts`
2. Update helper functions in `search-helpers.ts` if needed
3. Update test data with relevant search terms
4. Ensure tests pass locally before committing

## Troubleshooting

### Search Index Issues

If search isn't working, check:

1. **Build process:**
   ```bash
   pnpm build-local-pagefind
   ```

2. **Pagefind files:**
   - `/_next/static/pagefind/pagefind.js`
   - `/_next/static/pagefind/pagefind-index.json`

3. **Content indexing:**
   - Ensure content has `data-pagefind-body` attributes
   - Check if content is being built correctly

### Test Failures

Common test failure reasons:

1. **Selector changes** - Update selectors in tests
2. **Content changes** - Update test data with new content
3. **Timing issues** - Increase wait times or add better wait conditions
4. **Environment issues** - Check if server is running and accessible
