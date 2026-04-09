import { expect, Locator, Page } from "@playwright/test";

export class TimezonePage {
  // Locators are declared as readonly so they can't be reassigned after construction
  readonly addTimezoneButton: Locator;
  readonly labelInput: Locator;
  readonly timezoneSelect: Locator;
  readonly saveButton: Locator;
  readonly youRow: Locator;
  readonly tableRows: Locator;

  // page is stored privately so methods can use it to build dynamic locators
  constructor(private readonly page: Page) {
    // Opens the "Add timezone" form
    this.addTimezoneButton = page.getByRole("button", { name: "Add timezone" });
    // Targets the label input via its associated <label htmlFor="label"> — preferred over getByPlaceholder
    this.labelInput = page.getByLabel("Label");
    // Targets the select via its associated <label htmlFor="timezone">Location</label> — preferred over locator("select")
    this.timezoneSelect = page.getByLabel("Location");
    // Submits the "Add timezone" form and adds the new row to the table
    this.saveButton = page.getByRole("button", { name: "Save" });
    // The automatically created row representing the user's local timezone, marked "(You)"
    this.youRow = page.getByTestId("timezone-row").filter({ hasText: "(You)" });
    // All data rows in the table — identified by data-testid, no CSS structure dependency
    this.tableRows = page.getByTestId("timezone-row");
  }

  // Waits until the You row is visible — used as the app-ready signal after navigation
  async waitForReady(): Promise<void> {
    await expect(this.youRow).toBeVisible();
  }

  // Returns a locator for a data row matched by the label text
  rowByLabel(label: string): Locator {
    return this.page.getByTestId("timezone-row").filter({ hasText: label });
  }

  // Returns the Delete button scoped to a specific row, avoiding ambiguity with other Delete buttons on the page
  // /^Delete/ anchors to the start of the accessible name, guarding against future buttons that merely contain the word "Delete"
  deleteButtonFor(row: Locator): Locator {
    return row.getByRole("button", { name: /^Delete/ });
  }

  // Returns the Local Time cell within a given row using its data-testid
  timeCellOf(row: Locator): Locator {
    return row.getByTestId("local-time-cell");
  }

  // Returns the Local Time cell across all table rows in one locator
  // Used with allInnerTexts() to read all times at once without a manual loop
  allTimeCells(): Locator {
    return this.page.getByTestId("local-time-cell");
  }

  // Returns all <option> elements inside the timezone dropdown via their ARIA role
  timezoneOptions(): Locator {
    return this.timezoneSelect.getByRole("option");
  }

  // Extracts the value attribute from every dropdown option — keeps DOM introspection off the test
  // Callback typed as HTMLOptionElement[] to avoid the need for inline type casting
  async getTimezoneOptionValues(): Promise<string[]> {
    return this.timezoneOptions().evaluateAll(
      (options: HTMLOptionElement[]) => options.map((o) => o.value)
    );
  }

  // Reads the browser's local timezone using the Intl API — keeps page.evaluate out of test bodies
  async getLocalTimezone(): Promise<string> {
    return this.page.evaluate(() => Intl.DateTimeFormat().resolvedOptions().timeZone);
  }

  // Dismisses the Add timezone form without saving by pressing Escape
  async closeForm(): Promise<void> {
    await this.page.keyboard.press("Escape");
  }

  // Fills and submits the Add timezone form, then waits for the new row to appear in the table
  async addTimezone(label: string, timezoneValue: string): Promise<void> {
    await this.addTimezoneButton.click();
    await this.labelInput.fill(label);
    // selectOption matches by the option's value attribute (the IANA timezone ID)
    await this.timezoneSelect.selectOption({ value: timezoneValue });
    await this.saveButton.click();
    // Wait for the row to appear rather than using a fixed timeout
    await expect(this.rowByLabel(label)).toBeVisible();
  }
}
