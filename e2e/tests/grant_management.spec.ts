import { test, expect } from "../fixtures/auth"
import { createScreenshotCounter, takeScreenshot } from "../utils/screenshot"

test.describe("Grant Management - Edit & Visibility", () => {
  test("should edit a grant's description and deadline", async ({
    authenticatedAdminPage,
  }, testInfo) => {
    const sequentialScreenshotNames = createScreenshotCounter()
    const grantName = `Edit-Test-${Date.now()}`
    const deadline = "12/31/2026"
    const description = "Original description"

    // Navigate to grant management and create a grant
    await authenticatedAdminPage.goto("/admin/grants")
    await takeScreenshot(
      authenticatedAdminPage,
      testInfo,
      sequentialScreenshotNames("grant-management-page")
    )

    await expect(
      authenticatedAdminPage.getByText("Grant Management")
    ).toBeVisible()

    // Fill in create form
    const nameInput = authenticatedAdminPage
      .locator("input[placeholder='Grant name']")
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

    // Wait for grant to appear in table
    await expect(
      authenticatedAdminPage.getByText(grantName)
    ).toBeVisible({ timeout: 10000 })
    await takeScreenshot(
      authenticatedAdminPage,
      testInfo,
      sequentialScreenshotNames("grant-created")
    )

    // Click Edit button for the grant
    const grantRow = authenticatedAdminPage
      .locator("tr")
      .filter({ hasText: grantName })
    await grantRow.getByTitle("Edit grant").click()

    // Wait for edit form to appear
    await expect(
      authenticatedAdminPage.getByText(`Edit Grant: ${grantName}`)
    ).toBeVisible()
    await takeScreenshot(
      authenticatedAdminPage,
      testInfo,
      sequentialScreenshotNames("edit-form-open")
    )

    // Modify description and deadline
    const editDeadlineInput = authenticatedAdminPage
      .locator(".card")
      .filter({ hasText: `Edit Grant: ${grantName}` })
      .locator("input[placeholder='MM/DD/YY']")
    await editDeadlineInput.clear()
    await editDeadlineInput.fill("06/30/2027")

    const editDescriptionInput = authenticatedAdminPage
      .locator(".card")
      .filter({ hasText: `Edit Grant: ${grantName}` })
      .locator("textarea[placeholder='Grant description']")
    await editDescriptionInput.clear()
    await editDescriptionInput.fill("Updated description for testing")
    await takeScreenshot(
      authenticatedAdminPage,
      testInfo,
      sequentialScreenshotNames("fields-modified")
    )

    // Save changes
    await authenticatedAdminPage
      .getByRole("button", { name: /save changes/i })
      .click()

    // Wait for edit form to close
    await expect(
      authenticatedAdminPage.getByText(`Edit Grant: ${grantName}`)
    ).toBeHidden({ timeout: 10000 })

    // Verify updated description appears in the grant's row
    const updatedRow = authenticatedAdminPage
      .locator("tr")
      .filter({ hasText: grantName })
    await expect(
      updatedRow.getByText("Updated description for testing")
    ).toBeVisible({ timeout: 10000 })
    await takeScreenshot(
      authenticatedAdminPage,
      testInfo,
      sequentialScreenshotNames("edit-saved")
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

    const nameInput = authenticatedAdminPage
      .locator("input[placeholder='Grant name']")
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
    await expect(
      authenticatedAdminPage.getByText(grantName)
    ).toBeVisible({ timeout: 10000 })

    const grantRow = authenticatedAdminPage
      .locator("tr")
      .filter({ hasText: grantName })

    // Verify initial state is Visible
    await expect(grantRow.getByText("Visible")).toBeVisible()
    await takeScreenshot(
      authenticatedAdminPage,
      testInfo,
      sequentialScreenshotNames("grant-visible")
    )

    // Click Hide button
    await grantRow.getByTitle("Hide grant").click()

    // Verify badge changes to Hidden
    await expect(grantRow.getByText("Hidden")).toBeVisible({ timeout: 10000 })
    await takeScreenshot(
      authenticatedAdminPage,
      testInfo,
      sequentialScreenshotNames("grant-hidden")
    )

    // Click Show button to make it visible again
    await grantRow.getByTitle("Show grant").click()

    // Verify badge changes back to Visible
    await expect(grantRow.getByText("Visible")).toBeVisible({ timeout: 10000 })
    await takeScreenshot(
      authenticatedAdminPage,
      testInfo,
      sequentialScreenshotNames("grant-visible-again")
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

    const nameInput = authenticatedAdminPage
      .locator("input[placeholder='Grant name']")
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
    await expect(
      authenticatedAdminPage.getByText(grantName)
    ).toBeVisible({ timeout: 10000 })

    // Non-admin should see the grant on landing page
    await authenticatedNonAdminPage.goto("/")
    await expect(
      authenticatedNonAdminPage.getByText(grantName)
    ).toBeVisible({ timeout: 10000 })
    await takeScreenshot(
      authenticatedNonAdminPage,
      testInfo,
      sequentialScreenshotNames("grant-visible-on-landing")
    )

    // Admin hides the grant
    const grantRow = authenticatedAdminPage
      .locator("tr")
      .filter({ hasText: grantName })
    await grantRow.getByTitle("Hide grant").click()
    await expect(grantRow.locator(".badge").getByText("Hidden", { exact: true })).toBeVisible({ timeout: 10000 })
    await takeScreenshot(
      authenticatedAdminPage,
      testInfo,
      sequentialScreenshotNames("admin-hid-grant")
    )

    // Non-admin refreshes and should NOT see the grant
    await authenticatedNonAdminPage.reload()
    await authenticatedNonAdminPage.waitForLoadState("networkidle")
    await expect(
      authenticatedNonAdminPage.getByText(grantName)
    ).toBeHidden({ timeout: 10000 })
    await takeScreenshot(
      authenticatedNonAdminPage,
      testInfo,
      sequentialScreenshotNames("grant-hidden-on-landing")
    )
  })
})
