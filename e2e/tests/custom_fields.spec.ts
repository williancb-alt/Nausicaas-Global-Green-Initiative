import { test, expect } from "../fixtures/auth"
import { createScreenshotCounter, takeScreenshot } from "../utils/screenshot"

test.describe("Custom Fields - Funding Amount", () => {
  test("should create a grant with a required funding amount field and show Required badge", async ({
    authenticatedAdminPage,
  }, testInfo) => {
    const sequentialScreenshotNames = createScreenshotCounter()
    const grantName = `Funding-Field-Test-${Date.now()}`
    const deadline = "12/31/2026"
    const description = "Grant with required funding amount field"

    // Navigate to admin grants page
    await authenticatedAdminPage.goto("/admin/grants")

    // Fill grant name, deadline, description
    await authenticatedAdminPage
      .locator("input[placeholder='Grant name']")
      .fill(grantName)
    await authenticatedAdminPage
      .locator("input[placeholder='MM/DD/YY']")
      .first()
      .fill(deadline)
    await authenticatedAdminPage
      .locator("textarea[placeholder='Grant description']")
      .first()
      .fill(description)

    await takeScreenshot(
      authenticatedAdminPage,
      testInfo,
      sequentialScreenshotNames("grant-form-filled"),
    )

    // Click "Add Field" to open the modal
    await authenticatedAdminPage
      .getByRole("button", { name: /add field/i })
      .first()
      .click()

    // Select "Funding Amount Field"
    await authenticatedAdminPage
      .getByText("Funding Amount Field", { exact: false })
      .click()

    await takeScreenshot(
      authenticatedAdminPage,
      testInfo,
      sequentialScreenshotNames("currency-configurator"),
    )

    // Configure the field: label, min, max, and required
    const labelInput = authenticatedAdminPage.locator(
      "input[placeholder='e.g., Funding Amount (€)']",
    )
    await labelInput.clear()
    await labelInput.fill("Project Budget")

    // Check "Required field" checkbox
    await authenticatedAdminPage.locator("#currencyFieldRequired").check()

    await takeScreenshot(
      authenticatedAdminPage,
      testInfo,
      sequentialScreenshotNames("field-configured"),
    )

    // Click "Add Field" inside the configurator to save the field config
    await authenticatedAdminPage
      .getByRole("dialog")
      .getByRole("button", { name: /add field/i })
      .click()

    // Verify "Required" badge and "Funding Amount" badge appear in the preview
    const preview = authenticatedAdminPage.locator(".list-group")
    await expect(preview.getByText("Required")).toBeVisible({ timeout: 10000 })
    await expect(preview.getByText("Funding Amount")).toBeVisible({
      timeout: 10000,
    })

    await takeScreenshot(
      authenticatedAdminPage,
      testInfo,
      sequentialScreenshotNames("field-preview"),
    )

    // Create the grant
    await authenticatedAdminPage
      .getByRole("button", { name: /create grant/i })
      .click()

    // Verify grant appears in the table
    await expect(authenticatedAdminPage.getByText(grantName)).toBeVisible({
      timeout: 10000,
    })

    await takeScreenshot(
      authenticatedAdminPage,
      testInfo,
      sequentialScreenshotNames("grant-created"),
    )
  })
})
