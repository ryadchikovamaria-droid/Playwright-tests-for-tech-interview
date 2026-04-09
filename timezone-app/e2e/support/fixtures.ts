import { test as base, expect } from "@playwright/test";
import { TimezonePage } from "./TimezonePage";

// Defines the shape of the custom fixtures available to tests
type Fixtures = {
  timezonePage: TimezonePage;
};

// Extends Playwright's built-in test with a custom timezonePage fixture,
// so every test receives a fully set-up TimezonePage without any beforeEach boilerplate
export const test = base.extend<Fixtures>({
  timezonePage: async ({ page, context }, use: (fixture: TimezonePage) => Promise<void>) => {
    // Inject a script that runs before any page JS executes,
    // ensuring localStorage is empty so each test starts with a clean state
    await context.addInitScript(() => localStorage.clear());

    // Navigate to the app root — resolves against baseURL in playwright.config.ts
    await page.goto("/");

    // Instantiate the Page Object, passing the page so it can build locators
    const timezonePage = new TimezonePage(page);

    // Block until the app is ready (You row visible) before handing control to the test
    await timezonePage.waitForReady();

    // Hand the fixture to the test; Playwright pauses here until the test finishes
    await use(timezonePage);
  },
});

// Re-export expect so tests only need to import from this file
export { expect };
