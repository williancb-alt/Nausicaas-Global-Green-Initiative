import { test, expect } from "../fixtures/auth"
import { createScreenshotCounter, takeScreenshot } from "../utils/screenshot"
import {
  createGrantAsAdmin,
  openEditFormForGrant,
  editGrantFields,
  saveGrantEdit,
  getGrantRow,
} from "./steps/grant_management"

test.describe("Grant Management - Edit & Visibility", () => {
  test("should edit a grant's description and deadline", async ({
    authenticatedAdminPage,
  }, testInfo) => {
    const sequentialScreenshotNames = createScreenshotCounter()
    const grantName = `Edit-Test-${Date.now()}`

    await createGrantAsAdmin(
      authenticatedAdminPage,
      grantName,
      testInfo,
      sequentialScreenshotNames("grant-created"),
    )
    await takeScreenshot(
      authenticatedAdminPage,
      testInfo,
      sequentialScreenshotNames("grant-management-page"),
    )

    await openEditFormForGrant(authenticatedAdminPage, grantName)
    await takeScreenshot(
      authenticatedAdminPage,
      testInfo,
      sequentialScreenshotNames("edit-form-open"),
    )

    await editGrantFields(authenticatedAdminPage, grantName, {
      deadline: "06/30/2027",
      description: "Updated description for testing",
    })
    await takeScreenshot(
      authenticatedAdminPage,
      testInfo,
      sequentialScreenshotNames("fields-modified"),
    )

    await saveGrantEdit(authenticatedAdminPage, grantName)

    const updatedRow = await getGrantRow(authenticatedAdminPage, grantName)
    await expect(
      updatedRow.getByText("Updated description for testing"),
    ).toBeVisible({ timeout: 10000 })
    await takeScreenshot(
      authenticatedAdminPage,
      testInfo,
      sequentialScreenshotNames("edit-saved"),
    )
  })

  test("should toggle grant visibility to hidden and back", async ({
    authenticatedAdminPage,
  }, testInfo) => {
    const sequentialScreenshotNames = createScreenshotCounter()
    const grantName = `Visibility-Test-${Date.now()}`
    const deadline = "12/31/2026"
    const description = "Grant for visibility testing"

    // Navigate and create a grant
    await authenticatedAdminPage.goto("/admin/grants")

    const nameInput = authenticatedAdminPage.locator(
      "input[placeholder='Grant name']",
    )
    await nameInput.fill(grantName)

    await authenticatedAdminPage
      .locator("input[placeholder='MM/DD/YY']")
      .first()
      .fill(deadline)

    await authenticatedAdminPage
      .locator("textarea[placeholder='Grant description']")
      .first()
      .fill(description)

    await authenticatedAdminPage
      .getByRole("button", { name: /create grant/i })
      .click()

    // Wait for grant to appear (React Query auto-refetch after create)
    await expect(authenticatedAdminPage.getByText(grantName)).toBeVisible({
      timeout: 10000,
    })

    const grantRow = authenticatedAdminPage
      .locator("tr")
      .filter({ hasText: grantName })

    // Verify initial state is Visible
    await expect(grantRow.getByText("Visible")).toBeVisible()
    await takeScreenshot(
      authenticatedAdminPage,
      testInfo,
      sequentialScreenshotNames("grant-visible"),
    )

    // Click Hide button
    await grantRow.getByTitle("Hide grant").click()

    // Verify badge changes to Hidden
    await expect(grantRow.getByText("Hidden")).toBeVisible({ timeout: 10000 })
    await takeScreenshot(
      authenticatedAdminPage,
      testInfo,
      sequentialScreenshotNames("grant-hidden"),
    )

    // Click Show button to make it visible again
    await grantRow.getByTitle("Show grant").click()

    // Verify badge changes back to Visible
    await expect(grantRow.getByText("Visible")).toBeVisible({ timeout: 10000 })
    await takeScreenshot(
      authenticatedAdminPage,
      testInfo,
      sequentialScreenshotNames("grant-visible-again"),
    )
  })

  test("should hide grant from non-admin landing page", async ({
    authenticatedAdminPage,
    authenticatedNonAdminPage,
  }, testInfo) => {
    const sequentialScreenshotNames = createScreenshotCounter()
    const grantName = `Hidden-Public-Test-${Date.now()}`
    const deadline = "12/31/2026"
    const description = "Grant for hidden visibility testing"

    // Admin creates a grant
    await authenticatedAdminPage.goto("/admin/grants")

    const nameInput = authenticatedAdminPage.locator(
      "input[placeholder='Grant name']",
    )
    await nameInput.fill(grantName)

    await authenticatedAdminPage
      .locator("input[placeholder='MM/DD/YY']")
      .first()
      .fill(deadline)

    await authenticatedAdminPage
      .locator("textarea[placeholder='Grant description']")
      .first()
      .fill(description)

    await authenticatedAdminPage
      .getByRole("button", { name: /create grant/i })
      .click()

    // Wait for grant to appear (React Query auto-refetch after create)
    await expect(authenticatedAdminPage.getByText(grantName)).toBeVisible({
      timeout: 10000,
    })

    // Non-admin should see the grant on landing page
    await authenticatedNonAdminPage.goto("/")
    await expect(authenticatedNonAdminPage.getByText(grantName)).toBeVisible({
      timeout: 10000,
    })
    await takeScreenshot(
      authenticatedNonAdminPage,
      testInfo,
      sequentialScreenshotNames("grant-visible-on-landing"),
    )

    // Admin hides the grant
    const grantRow = authenticatedAdminPage
      .locator("tr")
      .filter({ hasText: grantName })
    await grantRow.getByTitle("Hide grant").click()
    await expect(
      grantRow.locator(".badge").getByText("Hidden", { exact: true }),
    ).toBeVisible({ timeout: 10000 })
    await takeScreenshot(
      authenticatedAdminPage,
      testInfo,
      sequentialScreenshotNames("admin-hid-grant"),
    )

    // Non-admin refreshes and should NOT see the grant
    await authenticatedNonAdminPage.reload()
    await authenticatedNonAdminPage.waitForLoadState("networkidle")
    await expect(authenticatedNonAdminPage.getByText(grantName)).toBeHidden({
      timeout: 10000,
    })
    await takeScreenshot(
      authenticatedNonAdminPage,
      testInfo,
      sequentialScreenshotNames("grant-hidden-on-landing"),
    )
  })
})
