import { expect, test } from "@playwright/test";
import { SEARCH_TEST_DATA, createSearchHelper } from "./utils/search-helpers";

test.describe("Search Functionality (Simplified)", () => {
  test.beforeEach(async ({ page }) => {
    const searchHelper = createSearchHelper(page);
    await searchHelper.navigateToDocs();
  });

  test("should display search input and perform basic search", async ({
    page,
  }) => {
    const searchHelper = createSearchHelper(page);

    // Verify search input is visible
    await searchHelper.expectSearchInputVisible();

    // Perform a search
    await searchHelper.performSearch("TinaDocs");

    // Verify results are shown
    await searchHelper.expectSearchResultsVisible();
  });

  test("should handle non-existent search terms", async ({ page }) => {
    const searchHelper = createSearchHelper(page);

    // Search for non-existent term
    await searchHelper.performSearch("xyz123nonexistent");

    // Should show "No Llamas Found" message
    const noResultsMessage = searchHelper.getNoResultsMessage();
    await expect(noResultsMessage).toBeVisible();
  });

  test("should clear search when clicking outside", async ({ page }) => {
    const searchHelper = createSearchHelper(page);

    // Perform a search
    await searchHelper.performSearch("TinaDocs");
    await searchHelper.expectSearchResultsVisible();

    // Clear search
    await searchHelper.clearSearch();

    // Verify results are hidden
    await searchHelper.expectSearchResultsNotVisible();

    // Verify input is cleared
    await searchHelper.expectSearchInputValue("");
  });

  test("should handle multiple search terms", async ({ page }) => {
    const searchHelper = createSearchHelper(page);

    // Test with known terms
    await searchHelper.testMultipleSearches(SEARCH_TEST_DATA.knownTerms);
  });

  test("should handle special characters in search", async ({ page }) => {
    const searchHelper = createSearchHelper(page);

    // Test with special characters
    await searchHelper.testMultipleSearches(SEARCH_TEST_DATA.specialCharacters);
  });

  test("should work on mobile viewport", async ({ page }) => {
    const searchHelper = createSearchHelper(page);

    await searchHelper.testMobileSearch();
  });

  test("should verify Pagefind files are accessible", async ({ page }) => {
    const searchHelper = createSearchHelper(page);

    await searchHelper.verifyPagefindFilesAccessible();
  });

  test("should complete search within reasonable time", async ({ page }) => {
    const searchHelper = createSearchHelper(page);

    const searchTime = await searchHelper.measureSearchPerformance("TinaDocs");

    // Search should complete within 3 seconds
    expect(searchTime).toBeLessThan(3000);

    // Verify search completed successfully
    await searchHelper.expectSearchResultsVisible();
  });
});
