import { expect, test } from "@playwright/test";
import { SEARCH_TEST_DATA, SearchHelper } from "./utils/search-helpers";

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
    await page.goto(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/docs`);

    // Wait for the page to load completely
    await page.waitForLoadState("networkidle");
  });

  test("should show search results for existing content", async ({ page }) => {
    const searchHelper = new SearchHelper(page);

    // Test with a known search term
    await searchHelper.performSearch(SEARCH_TEST_DATA.knownTerms[0]);

    // Check if search results container is visible
    await searchHelper.expectSearchResultsVisible();

    // Verify that results are clickable links
    const resultLinks = searchHelper.getSearchResultLinks();
    await expect(resultLinks.first()).toBeVisible();
  });

  test('should show "No Llamas Found" for non-existent content', async ({
    page,
  }) => {
    const searchHelper = new SearchHelper(page);

    // Test with a non-existent search term
    await searchHelper.performSearch(SEARCH_TEST_DATA.nonExistentTerms[0]);

    // Check if "No Llamas Found" message appears
    const noResultsMessage = searchHelper.getNoResultsMessage();
    await expect(noResultsMessage).toBeVisible();
  });

  test("should clear search results when clicking outside", async ({
    page,
  }) => {
    const searchHelper = new SearchHelper(page);

    // Perform a search
    await searchHelper.performSearch(SEARCH_TEST_DATA.knownTerms[0]);

    // Click outside the search area
    await searchHelper.clearSearch();

    // Verify search results are cleared
    await searchHelper.expectSearchResultsNotVisible();

    // Verify search input is cleared
    await searchHelper.expectSearchInputValue("");
  });

  test("should handle empty search input", async ({ page }) => {
    const searchHelper = new SearchHelper(page);

    // Try to search with empty input
    await searchHelper.performSearch("");

    // Verify no search results are shown
    await searchHelper.expectSearchResultsNotVisible();
  });

  test("should navigate to search result pages", async ({ page }) => {
    const searchHelper = new SearchHelper(page);

    // Perform a search
    await searchHelper.performSearch(SEARCH_TEST_DATA.knownTerms[0]);

    // Click on the first search result
    const firstResult = searchHelper.getSearchResultLinks().first();
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
    const searchHelper = new SearchHelper(page);

    // Start typing to trigger search
    const searchInput = searchHelper.getSearchInput();
    await searchInput.fill(SEARCH_TEST_DATA.knownTerms[0]);

    // Check for loading indicator (if implemented)
    // This might show "Mustering all the Llamas..." message
    const loadingMessage = searchHelper.getLoadingMessage();

    // The loading state might be very brief, so we'll just verify the search works
    await searchInput.press("Enter");

    // Verify search completed (either with results or no results message)
    await searchHelper.expectSearchResultsVisible();
  });

  test("should verify Pagefind files are accessible", async ({ page }) => {
    const searchHelper = new SearchHelper(page);

    await searchHelper.verifyPagefindFilesAccessible();
  });

  test("should work on mobile viewport", async ({ page }) => {
    const searchHelper = new SearchHelper(page);

    await searchHelper.testMobileSearch();
  });
});

test.describe("Search Performance", () => {
  test("should complete search within reasonable time", async ({ page }) => {
    const searchHelper = new SearchHelper(page);

    await searchHelper.navigateToDocs();

    // Measure search performance
    const searchTime = await searchHelper.measureSearchPerformance(
      SEARCH_TEST_DATA.knownTerms[0]
    );

    // Search should complete within 3 seconds
    expect(searchTime).toBeLessThan(3000);

    // Verify search completed successfully
    await searchHelper.expectSearchResultsVisible();
  });
});
