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

    // Wait for the search trigger to be available (client component hydration)
    const searchTrigger = page.locator('[data-testid="search-trigger"]');
    await searchTrigger.waitFor({ state: "visible", timeout: 10000 });
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

  test("should close the overlay when clicking outside", async ({ page }) => {
    const searchHelper = new SearchHelper(page);

    // Perform a search
    await searchHelper.performSearch(SEARCH_TEST_DATA.knownTerms[0]);

    // Click outside the dialog (on the backdrop) to dismiss it
    await searchHelper.closeByClickingOutside();

    // The overlay (and its input) should be gone, taking the results with it
    await expect(searchHelper.getSearchInput()).not.toBeVisible();
    await searchHelper.expectSearchResultsNotVisible();
  });

  test("should show prompt and no results for empty search input", async ({
    page,
  }) => {
    const searchHelper = new SearchHelper(page);

    // Focusing the empty input shows the prompt, not actual results.
    await searchHelper.performSearch("");

    // The empty-state prompt should be visible as feedback...
    await expect(searchHelper.getSearchPromptMessage()).toBeVisible();
    // ...but the "No Llamas Found" message should not appear for empty input.
    await expect(searchHelper.getNoResultsMessage()).not.toBeVisible();
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

    // Open the overlay, then start typing to trigger search
    await searchHelper.openSearch();
    const searchInput = searchHelper.getSearchInput();
    await searchInput.fill(SEARCH_TEST_DATA.knownTerms[0]);

    // Check for loading indicator (if implemented)
    // This might show "Mustering all the Llamas..." message
    const loadingMessage = searchHelper.getLoadingMessage();

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

  test("should open the search overlay with cmd/ctrl + k", async ({ page }) => {
    const searchHelper = new SearchHelper(page);

    // The overlay (and its input) should not exist on page load.
    await expect(searchHelper.getSearchInput()).not.toBeVisible();

    // Pressing cmd/ctrl + k should open the overlay and focus the input.
    await searchHelper.openSearchWithShortcut();
    await searchHelper.expectSearchInputFocused();

    // It should also show the empty-state prompt so the overlay gives
    // clear, visible feedback rather than sitting blank.
    await expect(searchHelper.getSearchPromptMessage()).toBeVisible();
  });

  test("should dismiss the overlay with Escape", async ({ page }) => {
    const searchHelper = new SearchHelper(page);

    // Open search and type a query.
    await searchHelper.openSearchWithShortcut();
    await searchHelper.getSearchInput().fill(SEARCH_TEST_DATA.knownTerms[0]);

    // Escape should close the overlay entirely.
    await searchHelper.getSearchInput().press("Escape");
    await expect(searchHelper.getSearchInput()).not.toBeVisible();
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
