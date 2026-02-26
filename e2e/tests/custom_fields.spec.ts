import { test, expect } from "../fixtures/auth"
import { createScreenshotCounter, takeScreenshot } from "../utils/screenshot"
import type { Page, TestInfo } from "@playwright/test"

type ScreenshotNamer = (name: string) => string

async function fillGrantForm(
  page: Page,
  grantName: string,
  deadline: string,
  description: string,
) {
  await page.locator("input[placeholder='Grant name']").fill(grantName)
  await page.locator("input[placeholder='MM/DD/YY']").first().fill(deadline)
  await page
    .locator("textarea[placeholder='Grant description']")
    .first()
    .fill(description)
}

async function addRequiredCurrencyField(page: Page) {
  await page
    .getByRole("button", { name: /add field/i })
    .first()
    .click()
  await page.getByText("Funding Amount Field", { exact: false }).click()

  const labelInput = page.locator(
    "input[placeholder='e.g., Funding Amount (€)']",
  )
  await labelInput.clear()
  await labelInput.fill("Project Budget")
  await page.locator("#currencyFieldRequired").check()

  await page
    .getByRole("dialog")
    .getByRole("button", { name: /add field/i })
    .click()
}

async function verifyFieldPreview(page: Page) {
  const preview = page.locator(".list-group")
  await expect(preview.getByText("Required")).toBeVisible({ timeout: 10000 })
  await expect(preview.getByText("Funding Amount")).toBeVisible({
    timeout: 10000,
  })
}

async function createGrantAndVerify(page: Page, grantName: string) {
  await page.getByRole("button", { name: /create grant/i }).click()
  await expect(page.getByText(grantName)).toBeVisible({ timeout: 10000 })
}

async function screenshot(
  page: Page,
  testInfo: TestInfo,
  namer: ScreenshotNamer,
  name: string,
) {
  await takeScreenshot(page, testInfo, namer(name))
}

test.describe("Custom Fields - Funding Amount", () => {
  test("should create a grant with a required funding amount field and show Required badge", async ({
    authenticatedAdminPage,
  }, testInfo) => {
    const namer = createScreenshotCounter()
    const grantName = `Funding-Field-Test-${Date.now()}`

    await authenticatedAdminPage.goto("/admin/grants")

    await fillGrantForm(
      authenticatedAdminPage,
      grantName,
      "12/31/2026",
      "Grant with required funding amount field",
    )
    await screenshot(
      authenticatedAdminPage,
      testInfo,
      namer,
      "grant-form-filled",
    )

    await addRequiredCurrencyField(authenticatedAdminPage)
    await screenshot(
      authenticatedAdminPage,
      testInfo,
      namer,
      "field-configured",
    )

    await verifyFieldPreview(authenticatedAdminPage)
    await screenshot(authenticatedAdminPage, testInfo, namer, "field-preview")

    await createGrantAndVerify(authenticatedAdminPage, grantName)
    await screenshot(authenticatedAdminPage, testInfo, namer, "grant-created")
  })
})
