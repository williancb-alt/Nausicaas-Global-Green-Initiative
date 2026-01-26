import { test, expect } from "../fixtures/auth";
import { createScreenshotCounter, takeScreenshot } from "../utils/screenshot";

test.describe("Authenticated User Flow", () => {
  test("should access home page when authenticated", async ({
    authenticatedPage,
  }, testInfo) => {
    const sequentialScreenshotNames = createScreenshotCounter();
    await authenticatedPage.goto("/");
    await takeScreenshot(
      authenticatedPage,
      testInfo,
      sequentialScreenshotNames("home-page-authenticated")
    );

    await expect(
      authenticatedPage.getByRole("heading", { name: /create grant/i })
    ).toBeVisible();

    await expect(authenticatedPage.getByText(/grant name/i)).toBeVisible();

    await expect(
      authenticatedPage.getByPlaceholder(/dd\/mm\/yyyy/i)
    ).toBeVisible();

    await expect(
      authenticatedPage.getByRole("button", { name: /create grant/i })
    ).toBeVisible();
    await takeScreenshot(
      authenticatedPage,
      testInfo,
      sequentialScreenshotNames("create-grant-form-visible")
    );

    await expect(
      authenticatedPage.getByRole("heading", { name: /list grants/i })
    ).toBeVisible();
    await takeScreenshot(
      authenticatedPage,
      testInfo,
      sequentialScreenshotNames("list-grants-section-visible")
    );

    await expect(
      authenticatedPage.getByRole("button", { name: /refresh/i })
    ).toBeVisible();
    await takeScreenshot(
      authenticatedPage,
      testInfo,
      sequentialScreenshotNames("home-page-fully-loaded")
    );
  });

  test("should be able to logout", async ({ authenticatedPage }, testInfo) => {
    const sequentialScreenshotNames = createScreenshotCounter();
    await authenticatedPage.goto("/");
    await takeScreenshot(authenticatedPage, testInfo, sequentialScreenshotNames("on-home-page"));

    await expect(
      authenticatedPage.getByRole("heading", { name: /create grant/i })
    ).toBeVisible();

    await authenticatedPage.getByRole("button", { name: /logout/i }).click();

    await expect(authenticatedPage).toHaveURL("/login", { timeout: 5000 });
    await takeScreenshot(authenticatedPage, testInfo, sequentialScreenshotNames("after-logout"));

    await expect(
      authenticatedPage.getByPlaceholder(/enter your email/i)
    ).toBeVisible();
    await expect(
      authenticatedPage.getByPlaceholder(/enter your password/i)
    ).toBeVisible();
    await expect(
      authenticatedPage.getByRole("button", { name: /sign in/i })
    ).toBeVisible();
    await takeScreenshot(authenticatedPage, testInfo, sequentialScreenshotNames("login-form-visible"));

    await authenticatedPage.goto("/");
    await expect(authenticatedPage).toHaveURL("/login");
    await takeScreenshot(
      authenticatedPage,
      testInfo,
      sequentialScreenshotNames("cannot-access-protected-route")
    );
  });

  test("should be able to create a grant when authenticated", async ({
    authenticatedPage,
  }, testInfo) => {
    const sequentialScreenshotNames = createScreenshotCounter();
    const grantName = `Test Grant ${Date.now()}`;
    const deadline = "31/12/2026";

    await authenticatedPage.goto("/");
    await takeScreenshot(authenticatedPage, testInfo, sequentialScreenshotNames("on-home-page"));

    await expect(
      authenticatedPage.getByRole("heading", { name: /create grant/i })
    ).toBeVisible();
    await takeScreenshot(
      authenticatedPage,
      testInfo,
      sequentialScreenshotNames("create-grant-form-visible")
    );

    const grantNameInput = authenticatedPage.getByRole("textbox").first();

    await grantNameInput.fill(grantName);
    await takeScreenshot(authenticatedPage, testInfo, sequentialScreenshotNames("filled-grant-name"));

    await authenticatedPage.getByPlaceholder(/dd\/mm\/yyyy/i).fill(deadline);
    await takeScreenshot(authenticatedPage, testInfo, sequentialScreenshotNames("filled-deadline"));

    await authenticatedPage
      .getByRole("button", { name: /create grant/i })
      .click();
    await takeScreenshot(
      authenticatedPage,
      testInfo,
      sequentialScreenshotNames("clicked-create-grant")
    );

    await expect(authenticatedPage.getByText(grantName)).toBeVisible({
      timeout: 10000,
    });
    await takeScreenshot(
      authenticatedPage,
      testInfo,
      sequentialScreenshotNames("grant-appears-in-list")
    );

    await expect(
      authenticatedPage
        .locator(".list-group-item")
        .filter({ hasText: grantName })
    ).toBeVisible();

    const grantItem = authenticatedPage
      .locator(".list-group-item")
      .filter({ hasText: grantName });
    await expect(grantItem).toContainText(/deadline/i, { timeout: 5000 });
  });
});
