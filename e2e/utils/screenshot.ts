import type { Page, TestInfo } from "@playwright/test"

export function createScreenshotCounter(): (name: string) => string {
  let counter = 0
  return (name: string) => {
    counter++
    const prefix = counter.toString().padStart(2, "0")
    const sanitisedName = name.replace(/\s+/g, "-").toLowerCase()
    return `${prefix}-${sanitisedName}`
  }
}

export async function takeScreenshot(
  page: Page,
  testInfo: TestInfo,
  name: string,
  options?: { fullPage?: boolean; timeout?: number },
): Promise<void> {
  const testName = testInfo.title.replace(/\s+/g, "-").toLowerCase()
  const sanitisedName = name.replace(/\s+/g, "-").toLowerCase()

  const path = `test-results/screenshots/${testName}/${sanitisedName}.png`

  await page.screenshot({
    path,
    fullPage: options?.fullPage ?? true,
    timeout: options?.timeout ?? 5000,
  })

  await testInfo.attach(sanitisedName, {
    path,
    contentType: "image/png",
  })
}
