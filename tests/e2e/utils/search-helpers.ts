import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export class SearchHelper {
  constructor(private page: Page) {}

  /**
   * Navigate to the docs page and wait for it to load
   */
  async navigateToDocs() {
    await this.page.goto(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/docs`);
    await this.page.waitForLoadState("networkidle");
    // Wait for the search trigger to be available (client component hydration)
    const searchTrigger = this.getSearchTrigger();
    await searchTrigger.waitFor({ state: "attached", timeout: 10000 });
  }

  /**
   * The button in the nav that opens the search overlay
   */
  getSearchTrigger() {
    return this.page.locator('[data-testid="search-trigger"]');
  }

  /**
   * Find and return the search input field (only present while the overlay is open)
   */
  getSearchInput() {
    return this.page.locator('input[placeholder="Search..."]');
  }

  /**
   * Open the search overlay by clicking the trigger, then wait for the input
   */
  async openSearch() {
    const trigger = this.getSearchTrigger();
    await trigger.waitFor({ state: "visible", timeout: 10000 });
    await trigger.click();
    await this.getSearchInput().waitFor({ state: "visible", timeout: 10000 });
  }

  /**
   * Perform a search with the given term, opening the overlay first if needed
   */
  async performSearch(searchTerm: string) {
    const searchInput = this.getSearchInput();
    if (!(await searchInput.isVisible())) {
      await this.openSearch();
    }
    await searchInput.fill(searchTerm);

    // Wait for search to complete
    await this.page.waitForTimeout(1000);
  }

  /**
   * Wait for search results to appear
   */
  async waitForSearchResults() {
    await this.page.waitForTimeout(1000);
  }

  /**
   * Get search results container
   */
  getSearchResultsContainer() {
    // Use the data-testid attribute for reliable selection
    return this.page.locator('[data-testid="search-results-container"]');
  }

  /**
   * Get "No Llamas Found" message
   */
  getNoResultsMessage() {
    // Use the data-testid attribute for reliable selection
    return this.page.locator('[data-testid="no-results-message"]');
  }

  /**
   * Get the empty-state prompt message shown when the search is focused but empty
   */
  getSearchPromptMessage() {
    return this.page.locator('[data-testid="search-prompt-message"]');
  }

  /**
   * Get loading message
   */
  getLoadingMessage() {
    // Look for the loading message within the search results container
    return this.page.locator(
      '[data-testid="search-results-container"] h4:has-text("Mustering all the Llamas")'
    );
  }

  /**
   * Get all search result links
   */
  getSearchResultLinks() {
    // Scope to the overlay's results so we don't match nav/sidebar /docs links.
    return this.page.locator(
      '[data-testid="search-results-container"] a[href*="/docs"]'
    );
  }

  /**
   * Verify search results are visible
   */
  async expectSearchResultsVisible() {
    const resultsContainer = this.getSearchResultsContainer();
    const noResultsMessage = this.getNoResultsMessage();

    await expect(resultsContainer.or(noResultsMessage)).toBeVisible();
  }

  /**
   * Verify search results are not visible
   */
  async expectSearchResultsNotVisible() {
    const resultsContainer = this.getSearchResultsContainer();
    await expect(resultsContainer).not.toBeVisible();
  }

  /**
   * Verify search input is visible
   */
  async expectSearchInputVisible() {
    const searchInput = this.getSearchInput();
    await expect(searchInput).toBeVisible();
  }

  /**
   * Verify search input has the expected value
   */
  async expectSearchInputValue(expectedValue: string) {
    const searchInput = this.getSearchInput();
    await expect(searchInput).toHaveValue(expectedValue);
  }

  /**
   * Open the search overlay via the cmd/ctrl + k keyboard shortcut
   */
  async openSearchWithShortcut() {
    const modifier = process.platform === "darwin" ? "Meta" : "Control";
    await this.page.keyboard.press(`${modifier}+KeyK`);
    await this.getSearchInput().waitFor({ state: "visible", timeout: 10000 });
  }

  /**
   * Verify the search input is currently focused
   */
  async expectSearchInputFocused() {
    const searchInput = this.getSearchInput();
    await expect(searchInput).toBeFocused();
  }

  /**
   * Close the overlay by clicking outside the dialog (on the backdrop)
   */
  async closeByClickingOutside() {
    // Click near the top-left corner of the backdrop, away from the centered dialog.
    await this.page.mouse.click(10, 10);
    await this.getSearchInput().waitFor({ state: "hidden", timeout: 5000 });
  }

  /**
   * Verify Pagefind files are accessible
   */
  async verifyPagefindFilesAccessible() {
    const isDev = this.page.url().includes("localhost");

    // Check Pagefind JavaScript file
    const pagefindJsResponse = await this.page.request.get(
      isDev
        ? "http://localhost:3000/pagefind/pagefind.js"
        : `${process.env.BASE_URL}${
            process.env.NEXT_PUBLIC_BASE_PATH ?? ""
          }/_next/static/pagefind/pagefind.js`
    );
    expect(pagefindJsResponse.status()).toBe(200);

    // Check Pagefind index file
    const pagefindIndexResponse = await this.page.request.get(
      isDev
        ? "http://localhost:3000/pagefind/pagefind-ui.js"
        : `${process.env.BASE_URL}${
            process.env.NEXT_PUBLIC_BASE_PATH ?? ""
          }/_next/static/pagefind/pagefind-ui.js`
    );

    expect(pagefindIndexResponse.status()).toBe(200);
  }

  /**
   * Measure search performance
   */
  async measureSearchPerformance(searchTerm: string): Promise<number> {
    const startTime = Date.now();

    await this.performSearch(searchTerm);

    const endTime = Date.now();
    return endTime - startTime;
  }

  /**
   * Test search with multiple terms
   */
  async testMultipleSearches(searchTerms: string[]) {
    // The overlay stays open between searches, so each term just refills the input.
    for (const term of searchTerms) {
      await this.performSearch(term);
      await this.expectSearchResultsVisible();
    }
  }

  /**
   * Test search on mobile viewport
   */
  async testMobileSearch() {
    await this.page.setViewportSize({ width: 375, height: 667 });
    await expect(this.getSearchTrigger()).toBeVisible();

    await this.performSearch("TinaDocs");
    await this.expectSearchResultsVisible();
  }
}

/**
 * Test data for search tests
 */
export const SEARCH_TEST_DATA = {
  knownTerms: [
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
  specialCharacters: [
    "@#$%",
    "test@example.com",
    "user-name",
    "file/path",
    "test&query",
    "test+query",
  ],
};

/**
 * Create a search helper instance
 */
export function createSearchHelper(page: Page): SearchHelper {
  return new SearchHelper(page);
}
