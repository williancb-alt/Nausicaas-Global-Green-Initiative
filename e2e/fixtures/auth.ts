import { test as base, type Page } from "@playwright/test"
import {
  createTestAdminUser,
  createTestUser,
  loginUser,
  type TestUser,
} from "../utils/users"

type AuthFixture = {
  authenticatedNonAdminPage: Page
  authenticatedAdminPage: Page
  testUser: TestUser
  testAdminUser: TestUser
}

export const test = base.extend<AuthFixture>({
  testUser: async ({}, use) => {
    const user = await createTestUser()
    await use(user)
  },

  testAdminUser: async ({}, use) => {
    const adminUser = await createTestAdminUser()
    await use(adminUser)
  },

  authenticatedNonAdminPage: async ({ browser, testUser }, use) => {
    const context = await browser.newContext()
    const cookies = await loginUser(testUser.email, testUser.password)

    await addCookiesToContext(context, cookies)

    const page = await context.newPage()
    await use(page)
    await context.close()
  },

  authenticatedAdminPage: async ({ browser, testAdminUser }, use) => {
    const context = await browser.newContext()
    const cookies = await loginUser(testAdminUser.email, testAdminUser.password)
    await addCookiesToContext(context, cookies)

    const page = await context.newPage()
    await use(page)
    await context.close()
  },
})

async function addCookiesToContext(context: any, cookies: string[]) {
  for (const individualCookie of cookies) {
    const [nameValue, ...attributes] = individualCookie.split(";")
    const [name, value] = nameValue.split("=")
    const cookie: any = {
      name: name.trim(),
      value: value.trim(),
      domain: "localhost",
      path: "/",
    }

    attributes.forEach(attr => {
      const [key, val] = attr.split("=").map(s => s.trim())
      const k = key.toLowerCase()
      if (k === "httponly") cookie.httpOnly = true
      if (k === "secure") cookie.secure = false
      if (k === "samesite") cookie.sameSite = val || "Lax"
    })

    await context.addCookies([cookie])
  }
}

export { expect } from "@playwright/test"
