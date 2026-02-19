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

export async function applyForGrantAsUser(userPage: Page, grantName: string) {
  await userPage.goto(`/grants/${encodeURIComponent(grantName)}/apply`)
  await expect(userPage.getByText(`Apply for: ${grantName}`)).toBeVisible({
    timeout: 15000,
  })
  await userPage.getByRole("button", { name: /submit application/i }).click()
  await expect(userPage.getByText("Application Submitted")).toBeVisible({
    timeout: 10000,
  })
}

export async function returnToHomeAndSeeGrant(
  userPage: Page,
  grantName: string,
) {
  await userPage.getByRole("button", { name: /return to home/i }).click()
  await expect(userPage.getByText(grantName)).toBeVisible({ timeout: 10000 })
}

export async function adminOpenApplicationReview(
  adminPage: Page,
  grantName: string,
) {
  await adminPage.goto("/admin")
  await expect(adminPage.getByText("Admin Dashboard")).toBeVisible({
    timeout: 10000,
  })
  const appRow = adminPage.locator("tr").filter({ hasText: grantName })
  await expect(appRow).toBeVisible({ timeout: 10000 })
  await appRow.getByRole("button", { name: /review/i }).click()
  await expect(adminPage.getByText(/application #/i)).toBeVisible({
    timeout: 10000,
  })
}

export async function userSeesGrantBadge(
  userPage: Page,
  grantName: string,
  badgeText: string,
) {
  await userPage.waitForTimeout(1000)
  await userPage.getByRole("link", { name: "Dashboard" }).click()
  await expect(
    userPage.getByText(/Recent Activity/i),
  ).toBeVisible({ timeout: 10000 })
  await userPage.getByRole("link", { name: "Home", exact: true }).click()
  await expect(
    userPage.getByRole("heading", { name: "Available Grants" }),
  ).toBeVisible({ timeout: 10000 })
  const card = userPage.locator(".card").filter({ hasText: grantName })
  await expect(card.locator(".badge").getByText(badgeText)).toBeVisible({
    timeout: 10000,
  })
}
