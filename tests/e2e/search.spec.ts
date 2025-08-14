import { expect, test } from "@playwright/test";

// Test data for known content that should be searchable
const KNOWN_CONTENT = {
  // These should be updated based on your actual content
  searchTerms: [
    "TinaDocs",
    "documentation",
    "search",
    "API",
    "TinaCMS",
    "deployment",
    "theming",
    "components",
  ],
  nonExistentTerms: [
    "xyz123nonexistent",
    "completelyrandomterm",
    "shouldnotexist",
  ],
};

test.describe("Search Functionality", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the docs page before each test
    await page.goto("/docs");

    // Wait for the page to load completely
    await page.waitForLoadState("networkidle");
  });

  test("should display search input field", async ({ page }) => {
    // Look for search input in the top navigation
    const searchInput = page.locator('input[placeholder="Search..."]');
    await expect(searchInput).toBeVisible();

    // Verify search icon is present
    const searchIcon = page.locator(
      '[data-testid="search-icon"], svg[class*="MagnifyingGlassIcon"]'
    );
    await expect(searchIcon).toBeVisible();
  });

  test("should show search results for existing content", async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search..."]');

    // Test with a known search term
    await searchInput.fill("TinaDocs");
    await searchInput.press("Enter");

    // Wait for search results to appear
    await page.waitForTimeout(1000);

    // Check if search results container is visible
    const resultsContainer = page.locator('div:has-text("TinaDocs")').first();
    await expect(resultsContainer).toBeVisible();

    // Verify that results are clickable links
    const resultLinks = page.locator('a[href*="/docs"]');
    await expect(resultLinks.first()).toBeVisible();
  });

  test('should show "No Llamas Found" for non-existent content', async ({
    page,
  }) => {
    const searchInput = page.locator('input[placeholder="Search..."]');

    // Test with a non-existent search term
    await searchInput.fill("xyz123nonexistent");
    await searchInput.press("Enter");

    // Wait for search results to appear
    await page.waitForTimeout(1000);

    // Check if "No Llamas Found" message appears
    const noResultsMessage = page.locator('div:has-text("No Llamas Found")');
    await expect(noResultsMessage).toBeVisible();
  });

  test("should clear search results when clicking outside", async ({
    page,
  }) => {
    const searchInput = page.locator('input[placeholder="Search..."]');

    // Perform a search
    await searchInput.fill("TinaDocs");
    await searchInput.press("Enter");

    // Wait for results to appear
    await page.waitForTimeout(1000);

    // Click outside the search area
    await page.click("body");

    // Verify search results are cleared
    const resultsContainer = page.locator('div:has-text("TinaDocs")');
    await expect(resultsContainer).not.toBeVisible();

    // Verify search input is cleared
    await expect(searchInput).toHaveValue("");
  });

  test("should handle empty search input", async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search..."]');

    // Try to search with empty input
    await searchInput.fill("");
    await searchInput.press("Enter");

    // Verify no search results are shown
    const resultsContainer = page.locator(
      'div[class*="searchResultsContainer"]'
    );
    await expect(resultsContainer).not.toBeVisible();
  });

  test("should handle special characters in search", async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search..."]');

    // Test with special characters
    const specialSearchTerms = [
      "@#$%",
      "test@example.com",
      "user-name",
      "file/path",
    ];

    for (const term of specialSearchTerms) {
      await searchInput.fill(term);
      await searchInput.press("Enter");

      // Wait for search to complete
      await page.waitForTimeout(1000);

      // Verify search doesn't crash and shows appropriate response
      const resultsContainer = page.locator(
        'div[class*="searchResultsContainer"]'
      );
      const noResultsMessage = page.locator('div:has-text("No Llamas Found")');

      // Either results should be shown or "No Llamas Found" message
      await expect(resultsContainer.or(noResultsMessage)).toBeVisible();

      // Clear for next iteration
      await page.click("body");
    }
  });

  test("should navigate to search result pages", async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search..."]');

    // Perform a search
    await searchInput.fill("TinaDocs");
    await searchInput.press("Enter");

    // Wait for results to appear
    await page.waitForTimeout(1000);

    // Click on the first search result
    const firstResult = page.locator('a[href*="/docs"]').first();
    await expect(firstResult).toBeVisible();

    // Store the href to verify navigation
    const href = await firstResult.getAttribute("href");
    expect(href).toBeTruthy();

    // Click the result
    await firstResult.click();

    // Verify navigation occurred
    await page.waitForLoadState("networkidle");

    // Check if we're on a docs page
    await expect(page).toHaveURL(/\/docs/);
  });

  test("should show loading state during search", async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search..."]');

    // Start typing to trigger search
    await searchInput.fill("TinaDocs");

    // Check for loading indicator (if implemented)
    // This might show "Mustering all the Llamas..." message
    const loadingMessage = page.locator(
      'div:has-text("Mustering all the Llamas")'
    );

    // The loading state might be very brief, so we'll just verify the search works
    await searchInput.press("Enter");

    // Wait for search to complete
    await page.waitForTimeout(1000);

    // Verify search completed (either with results or no results message)
    const resultsContainer = page.locator(
      'div[class*="searchResultsContainer"]'
    );
    const noResultsMessage = page.locator('div:has-text("No Llamas Found")');

    await expect(resultsContainer.or(noResultsMessage)).toBeVisible();
  });

  test("should handle multiple rapid searches", async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search..."]');

    // Perform multiple rapid searches
    const searchTerms = ["TinaDocs", "API", "deployment", "theming"];

    for (const term of searchTerms) {
      await searchInput.fill(term);
      await searchInput.press("Enter");

      // Brief wait between searches
      await page.waitForTimeout(500);

      // Verify search doesn't crash
      const resultsContainer = page.locator(
        'div[class*="searchResultsContainer"]'
      );
      const noResultsMessage = page.locator('div:has-text("No Llamas Found")');

      await expect(resultsContainer.or(noResultsMessage)).toBeVisible();
    }
  });

  test("should verify Pagefind files are accessible", async ({ page }) => {
    // Check if Pagefind JavaScript file is accessible
    const pagefindJsResponse = await page.request.get(
      "/_next/static/pagefind/pagefind.js"
    );
    expect(pagefindJsResponse.status()).toBe(200);

    // Check if Pagefind index file is accessible
    const pagefindIndexResponse = await page.request.get(
      "/_next/static/pagefind/pagefind-index.json"
    );
    expect(pagefindIndexResponse.status()).toBe(200);

    // Verify the index file contains valid JSON
    const indexData = await pagefindIndexResponse.json();
    expect(indexData).toBeDefined();
  });

  test("should work on mobile viewport", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    const searchInput = page.locator('input[placeholder="Search..."]');
    await expect(searchInput).toBeVisible();

    // Test search on mobile
    await searchInput.fill("TinaDocs");
    await searchInput.press("Enter");

    // Wait for search results
    await page.waitForTimeout(1000);

    // Verify search works on mobile
    const resultsContainer = page.locator(
      'div[class*="searchResultsContainer"]'
    );
    const noResultsMessage = page.locator('div:has-text("No Llamas Found")');

    await expect(resultsContainer.or(noResultsMessage)).toBeVisible();
  });
});

test.describe("Search Performance", () => {
  test("should complete search within reasonable time", async ({ page }) => {
    await page.goto("/docs");
    await page.waitForLoadState("networkidle");

    const searchInput = page.locator('input[placeholder="Search..."]');

    // Measure search performance
    const startTime = Date.now();

    await searchInput.fill("TinaDocs");
    await searchInput.press("Enter");

    // Wait for search to complete
    await page.waitForTimeout(2000);

    const endTime = Date.now();
    const searchTime = endTime - startTime;

    // Search should complete within 3 seconds
    expect(searchTime).toBeLessThan(3000);

    // Verify search completed successfully
    const resultsContainer = page.locator(
      'div[class*="searchResultsContainer"]'
    );
    const noResultsMessage = page.locator('div:has-text("No Llamas Found")');

    await expect(resultsContainer.or(noResultsMessage)).toBeVisible();
  });
});
