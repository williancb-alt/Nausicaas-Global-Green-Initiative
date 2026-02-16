import { test, expect } from "../fixtures/auth"
import { createScreenshotCounter, takeScreenshot } from "../utils/screenshot"
import {
  createGrantAsAdmin,
  applyForGrantAsUser,
  returnToHomeAndSeeGrant,
  adminOpenApplicationReview,
  userSeesGrantBadge,
} from "./steps/application_flow"

test.describe("Application Lifecycle", () => {
  // COMMENTED OUT: This test is redundant - it only tests submitting an application and seeing "Pending Review" status.
  // The approve and deny tests below fully cover this functionality (they do the same setup PLUS the admin review workflow).
  // Keeping this commented for potential future use if we need a simpler/faster test.
  // test("should apply for a grant and see status on landing page", async ({
  //   authenticatedAdminPage,
  //   authenticatedNonAdminPage,
  // }, testInfo) => {
  //   const sequentialScreenshotNames = createScreenshotCounter()
  //   const grantName = `Apply-Test-${Date.now()}`
  //   const deadline = "12/31/2026"
  //   const description = "Grant for application testing"

  //   // Admin creates a grant
  //   await authenticatedAdminPage.goto("/admin/grants")
  //   await authenticatedAdminPage
  //     .locator("input[placeholder='Grant name']")
  //     .fill(grantName)
  //   await authenticatedAdminPage
  //     .locator("input[placeholder='MM/DD/YY']")
  //     .first()
  //     .fill(deadline)
  //   await authenticatedAdminPage
  //     .locator("textarea[placeholder='Grant description']")
  //     .first()
  //     .fill(description)
  //   await authenticatedAdminPage
  //     .getByRole("button", { name: /create grant/i })
  //     .click()

  //   await expect(
  //     authenticatedAdminPage.getByText(grantName)
  //   ).toBeVisible({ timeout: 10000 })
  //   await takeScreenshot(
  //     authenticatedAdminPage,
  //     testInfo,
  //     sequentialScreenshotNames("admin-created-grant")
  //   )

  //   // Non-admin navigates directly to the application page
  //   await authenticatedNonAdminPage.goto(`/grants/${encodeURIComponent(grantName)}/apply`)

  //   // Should be on the application page (not redirected to login)
  //   await expect(
  //     authenticatedNonAdminPage.getByText(`Apply for: ${grantName}`)
  //   ).toBeVisible({ timeout: 15000 })
  //   await takeScreenshot(
  //     authenticatedNonAdminPage,
  //     testInfo,
  //     sequentialScreenshotNames("application-form")
  //   )

  //   // Submit the application
  //   await authenticatedNonAdminPage
  //     .getByRole("button", { name: /submit application/i })
  //     .click()

  //   // Verify success message
  //   await expect(
  //     authenticatedNonAdminPage.getByText("Application Submitted")
  //   ).toBeVisible({ timeout: 10000 })
  //   await expect(
  //     authenticatedNonAdminPage.getByText("Thank you for your application!")
  //   ).toBeVisible()
  //   await takeScreenshot(
  //     authenticatedNonAdminPage,
  //     testInfo,
  //     sequentialScreenshotNames("application-submitted")
  //   )

  //   // Return to home and check status badge
  //   await authenticatedNonAdminPage
  //     .getByRole("button", { name: /return to home/i })
  //     .click()

  //   await expect(
  //     authenticatedNonAdminPage.getByText(grantName)
  //   ).toBeVisible({ timeout: 10000 })

  //   // Should show "Pending Review" badge in the card header
  //   const grantCardAfter = authenticatedNonAdminPage
  //     .locator(".card")
  //     .filter({ hasText: grantName })
  //   await expect(
  //     grantCardAfter.locator(".badge").getByText("Pending Review")
  //   ).toBeVisible({ timeout: 10000 })
  //   await takeScreenshot(
  //     authenticatedNonAdminPage,
  //     testInfo,
  //     sequentialScreenshotNames("status-on-landing-page")
  //   )
  // })

  test("should approve an application as admin", async ({
    authenticatedAdminPage,
    authenticatedNonAdminPage,
  }, testInfo) => {
    const sequentialScreenshotNames = createScreenshotCounter()
    const grantName = `Approve-Test-${Date.now()}`

    await createGrantAsAdmin(
      authenticatedAdminPage,
      grantName,
      testInfo,
      sequentialScreenshotNames("admin-created-grant"),
    )

    await applyForGrantAsUser(authenticatedNonAdminPage, grantName)
    await takeScreenshot(
      authenticatedNonAdminPage,
      testInfo,
      sequentialScreenshotNames("user-applied"),
    )

    await returnToHomeAndSeeGrant(authenticatedNonAdminPage, grantName)

    await adminOpenApplicationReview(authenticatedAdminPage, grantName)
    await takeScreenshot(
      authenticatedAdminPage,
      testInfo,
      sequentialScreenshotNames("application-review-page"),
    )

    authenticatedAdminPage.on("dialog", dialog => dialog.accept())
    await authenticatedAdminPage
      .getByRole("button", { name: /^approve$/i })
      .click()

    await expect(
      authenticatedAdminPage.getByRole("button", { name: /✓ approved/i }),
    ).toBeVisible({ timeout: 10000 })
    await takeScreenshot(
      authenticatedAdminPage,
      testInfo,
      sequentialScreenshotNames("application-approved"),
    )

    await userSeesGrantBadge(authenticatedNonAdminPage, grantName, "✓ Approved")
    await takeScreenshot(
      authenticatedNonAdminPage,
      testInfo,
      sequentialScreenshotNames("user-sees-approved"),
    )
  })

  test("should deny an application as admin", async ({
    authenticatedAdminPage,
    authenticatedNonAdminPage,
  }, testInfo) => {
    const sequentialScreenshotNames = createScreenshotCounter()
    const grantName = `Deny-Test-${Date.now()}`

    await createGrantAsAdmin(
      authenticatedAdminPage,
      grantName,
      testInfo,
      sequentialScreenshotNames("admin-created-grant"),
    )

    await applyForGrantAsUser(authenticatedNonAdminPage, grantName)
    await takeScreenshot(
      authenticatedNonAdminPage,
      testInfo,
      sequentialScreenshotNames("user-applied"),
    )

    await returnToHomeAndSeeGrant(authenticatedNonAdminPage, grantName)

    await adminOpenApplicationReview(authenticatedAdminPage, grantName)
    await takeScreenshot(
      authenticatedAdminPage,
      testInfo,
      sequentialScreenshotNames("review-page"),
    )

    authenticatedAdminPage.on("dialog", dialog => dialog.accept())
    await authenticatedAdminPage
      .getByRole("button", { name: /^deny$/i })
      .click()

    await expect(
      authenticatedAdminPage.getByRole("button", { name: /✗ denied/i }),
    ).toBeVisible({ timeout: 10000 })
    await takeScreenshot(
      authenticatedAdminPage,
      testInfo,
      sequentialScreenshotNames("application-denied"),
    )

    await userSeesGrantBadge(authenticatedNonAdminPage, grantName, "✗ Denied")
    await takeScreenshot(
      authenticatedNonAdminPage,
      testInfo,
      sequentialScreenshotNames("user-sees-denied"),
    )
  })
})
