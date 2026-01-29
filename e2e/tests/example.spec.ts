import { test, expect } from "@playwright/test";
import { createScreenshotCounter, takeScreenshot } from "../utils/screenshot";

test.describe("Authentication Flow", () => {
  test("should display login page", async ({ page }, testInfo) => {
    const sequentialScreenshotNames = createScreenshotCounter();
    await page.goto("/login");

    await expect(page.getByPlaceholder(/enter your email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/enter your password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();

    await takeScreenshot(page, testInfo, sequentialScreenshotNames("login-page-loaded"));
  });

  test("should navigate to signup page", async ({ page }, testInfo) => {
    const sequentialScreenshotNames = createScreenshotCounter();
    await page.goto("/login");

    await takeScreenshot(page, testInfo, sequentialScreenshotNames("on-login-page"));

    await page.getByRole("link", { name: /don't have an account/i }).click();
    await takeScreenshot(page, testInfo, sequentialScreenshotNames("clicked-signup-link"));

    await expect(page).toHaveURL("/signup");
    await takeScreenshot(page, testInfo, sequentialScreenshotNames("on-signup-page"));

    await expect(page.getByPlaceholder(/enter your email/i)).toBeVisible();
    await expect(
      page.getByPlaceholder(/enter your password/i).first()
    ).toBeVisible();
    await expect(page.getByPlaceholder(/confirm your password/i)).toBeVisible();
    await takeScreenshot(page, testInfo, sequentialScreenshotNames("signup-form-visible"));
  });

  test("should successfully sign up a new user", async ({ page }, testInfo) => {
    const sequentialScreenshotNames = createScreenshotCounter();
    const timestamp = Date.now();
    const email = `test-${timestamp}@example.com`;
    const password = "TestPassword123!";

    await page.goto("/signup");
    await takeScreenshot(page, testInfo, sequentialScreenshotNames("on-signup-page"));

    await page.getByPlaceholder(/enter your email/i).fill(email);
    await takeScreenshot(page, testInfo, sequentialScreenshotNames("filled-email"));

    await page
      .getByPlaceholder(/enter your password/i)
      .first()
      .fill(password);
    await takeScreenshot(page, testInfo, sequentialScreenshotNames("filled-password"));

    await page.getByPlaceholder(/confirm your password/i).fill(password);
    await takeScreenshot(page, testInfo, sequentialScreenshotNames("filled-confirm-password"));

    await page.getByRole("button", { name: /sign up/i }).click();
    await takeScreenshot(page, testInfo, sequentialScreenshotNames("clicked-signup-button"));

    await expect(page).toHaveURL("/", { timeout: 10000 });
    await takeScreenshot(page, testInfo, sequentialScreenshotNames("redirected-to-home"));

    await expect(page.locator("body")).toBeVisible();
    await takeScreenshot(page, testInfo, sequentialScreenshotNames("on-home-page"));
  });

  test("should show error for invalid login", async ({ page }, testInfo) => {
    const sequentialScreenshotNames = createScreenshotCounter();
    await page.goto("/login");
    await takeScreenshot(page, testInfo, sequentialScreenshotNames("login-page"));

    await page
      .getByPlaceholder(/enter your email/i)
      .fill("invalid@example.com");
    await takeScreenshot(page, testInfo, sequentialScreenshotNames("filled-email"));

    await page.getByPlaceholder(/enter your password/i).fill("wrongpassword");
    await takeScreenshot(page, testInfo, sequentialScreenshotNames("filled-password"));

    await page.getByRole("button", { name: /sign in/i }).click();
    await takeScreenshot(page, testInfo, sequentialScreenshotNames("clicked-login-button"));

    await expect(page.locator("body")).toContainText(
      /email or password does not match/i,
      {
        timeout: 5000,
      }
    );
    await takeScreenshot(page, testInfo, sequentialScreenshotNames("error-message-shown"));
  });
});
