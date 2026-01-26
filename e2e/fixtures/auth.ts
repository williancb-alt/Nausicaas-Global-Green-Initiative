import { test as base, type Page } from "@playwright/test";
import { createTestUser, loginUser, type TestUser } from "../utils/users";

type AuthFixture = {
  authenticatedPage: Page;
  testUser: TestUser;
};

export const test = base.extend<AuthFixture>({
  testUser: async ({}, use) => {
    const user = await createTestUser();
    await use(user);
  },

  authenticatedPage: async ({ browser, testUser }, use) => {
    const context = await browser.newContext();
    const cookies = await loginUser(testUser.email, testUser.password);

    for (const individualCookie of cookies) {
      const [nameValue, ...attributes] = individualCookie.split(";");
      const [name, value] = nameValue.split("=");
      const cookie: any = {
        name: name.trim(),
        value: value.trim(),
        domain: "localhost",
        path: "/",
      };

      for (const attr of attributes) {
        const [key, val] = attr.split("=").map((s) => s.trim());
        if (key.toLowerCase() === "httponly") {
          cookie.httpOnly = true;
        } else if (key.toLowerCase() === "secure") {
          cookie.secure = false;
        } else if (key.toLowerCase() === "samesite") {
          cookie.sameSite = val || "Lax";
        } else if (key.toLowerCase() === "max-age") {
          cookie.maxAge = parseInt(val || "0", 10);
        }
      }

      await context.addCookies([cookie]);
    }

    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect } from "@playwright/test";
