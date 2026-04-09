import { test, expect } from "./support/fixtures";
import { timeToMinutes } from "./support/helpers";

// ─── AC1: Users can add timezones and see the current time for each ───────────

test("[TC-01] Users can add timezones and see the current time for each", async ({ timezonePage }) => {
  await timezonePage.addTimezone("East Coast", "America/New_York");

  const row = timezonePage.rowByLabel("East Coast");
  await expect(timezonePage.timeCellOf(row)).toHaveText(/\d{1,2}:\d{2}\s*(AM|PM)/i);
});

// ─── AC2: A local "You" row is automatically created on load ──────────────────

test('[TC-02] A local "You" row is automatically created on load', async ({ timezonePage }) => {
  await expect(timezonePage.youRow).toBeVisible();

  const localZone = await timezonePage.getLocalTimezone();
  await expect(timezonePage.youRow).toContainText(localZone);
});

// ─── AC3: Table is sorted by current time, earliest first ────────────────────

// FAILS: Bug 2 (rows sort by time string numerically, not chronologically) and
// Bug 5 (rows sort alphabetically by label instead of by current time)
test("[TC-03] Table is sorted by current time, earliest first", async ({ timezonePage }) => {
  // 4 timezones with known offsets spanning a wide time range
  await timezonePage.addTimezone("Hawaii", "Pacific/Honolulu");  // UTC-10
  await timezonePage.addTimezone("Alaska", "America/Juneau");    // UTC-9
  await timezonePage.addTimezone("Mountain", "America/Denver");  // UTC-7
  await timezonePage.addTimezone("Eastern", "America/New_York"); // UTC-5

  // Read all time cell values at once rather than row by row
  const timeTexts = await timezonePage.allTimeCells().allInnerTexts();
  const minutes: number[] = timeTexts.map(timeToMinutes);

  for (let i = 1; i < minutes.length; i++) {
    expect(
      minutes[i],
      `Row ${i + 1} (${timeTexts[i]}) should be >= row ${i} (${timeTexts[i - 1]})`
    ).toBeGreaterThanOrEqual(minutes[i - 1]);
  }
});

// ─── AC4: User can add any timezone with any label ────────────────────────────

// FAILS: Bug 3 (timezone picker only offers 6 hardcoded US timezones, international zones unavailable)
test("[TC-04] User can add any timezone with any label", async ({ timezonePage }) => {
  await timezonePage.addTimezoneButton.click();

  const optionValues = await timezonePage.getTimezoneOptionValues();
  await timezonePage.closeForm();

  const hasEuropean = optionValues.some(
    (v: string) => v.startsWith("Europe/") || v === "CET" || v === "CEST"
  );
  expect(
    hasEuropean,
    "Expected at least one European timezone option (e.g. Europe/Paris) to be available"
  ).toBe(true);
});

// ─── AC5: User can delete any row except the "You" row ───────────────────────

test("[TC-05] User can delete a regular timezone row", async ({ timezonePage }) => {
  await timezonePage.addTimezone("To Be Deleted", "America/New_York");

  // addTimezone already asserts the row is visible — no redundant check needed here
  const targetRow = timezonePage.rowByLabel("To Be Deleted");
  await timezonePage.deleteButtonFor(targetRow).click();
  await expect(targetRow).not.toBeVisible();
});

// FAILS: Bug 1 (Delete button on the You row is enabled and removes the row when clicked)
test("[TC-06] User cannot delete the You row", async ({ timezonePage }) => {
  await expect(
    timezonePage.deleteButtonFor(timezonePage.youRow),
    "Delete button on the You row should be disabled"
  ).toBeDisabled();
});
