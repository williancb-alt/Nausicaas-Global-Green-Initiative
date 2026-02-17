import { expect, Page, TestInfo } from "@playwright/test"
import { takeScreenshot } from "../../utils/screenshot"

const DEADLINE = "12/31/2026"
const DEFAULT_DESCRIPTION = "Grant for E2E testing"

export async function createGrantAsAdmin(
  adminPage: Page,
  grantName: string,
  testInfo?: TestInfo,
  screenshotName?: string,
) {
  await adminPage.goto("/admin/grants")
  await adminPage.locator("input[placeholder='Grant name']").fill(grantName)
  await adminPage
    .locator("input[placeholder='MM/DD/YY']")
    .first()
    .fill(DEADLINE)
  await adminPage
    .locator("textarea[placeholder='Grant description']")
    .first()
    .fill(DEFAULT_DESCRIPTION)
  await adminPage.getByRole("button", { name: /create grant/i }).click()
  await expect(adminPage.getByText(grantName)).toBeVisible({ timeout: 10000 })
  if (testInfo && screenshotName) {
    await takeScreenshot(adminPage, testInfo, screenshotName)
  }
}

export async function openEditFormForGrant(adminPage: Page, grantName: string) {
  const grantRow = adminPage.locator("tr").filter({ hasText: grantName })
  await grantRow.getByTitle("Edit grant").click()
  await expect(adminPage.getByText(`Edit Grant: ${grantName}`)).toBeVisible()
}

export async function editGrantFields(
  adminPage: Page,
  grantName: string,
  updates: { deadline?: string; description?: string },
) {
  const editCard = adminPage
    .locator(".card")
    .filter({ hasText: `Edit Grant: ${grantName}` })

  if (updates.deadline) {
    const deadlineInput = editCard.locator("input[placeholder='MM/DD/YY']")
    await deadlineInput.clear()
    await deadlineInput.fill(updates.deadline)
  }

  if (updates.description) {
    const descriptionInput = editCard.locator(
      "textarea[placeholder='Grant description']",
    )
    await descriptionInput.clear()
    await descriptionInput.fill(updates.description)
  }
}

export async function saveGrantEdit(adminPage: Page, grantName: string) {
  await adminPage.getByRole("button", { name: /save changes/i }).click()
  await expect(adminPage.getByText(`Edit Grant: ${grantName}`)).toBeHidden({
    timeout: 10000,
  })
}

export async function getGrantRow(adminPage: Page, grantName: string) {
  return adminPage.locator("tr").filter({ hasText: grantName })
}
