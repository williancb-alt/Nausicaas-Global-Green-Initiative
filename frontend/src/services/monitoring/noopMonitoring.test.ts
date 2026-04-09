import { describe, it, expect } from "vitest"
import { NoopMonitoringService } from "./noopMonitoring"
import type { MonitoringService } from "./types"

describe("NoopMonitoringService", () => {
  // Create a single instance of the service to test all methods
  const service: MonitoringService = new NoopMonitoringService()

  it("captureException does not throw an error", () => {
    // Test both with and without context
    expect(() => service.captureException(new Error("test"))).not.toThrow()
    expect(() =>
      service.captureException(new Error("test"), { key: "value" }),
    ).not.toThrow()
  })

  it("captureMessage does not throw an error", () => {
    // Test both with and without level
    expect(() => service.captureMessage("msg")).not.toThrow()
    expect(() => service.captureMessage("msg", "error")).not.toThrow()
  })

  it("setUser does not throw an error", () => {
    // Test both setting a user and clearing the user
    expect(() => service.setUser({ id: "1", email: "a@b.com" })).not.toThrow()
    expect(() => service.setUser(null)).not.toThrow()
  })

  it("addBreadcrumb does not throw an error", () => {
    // Test with minimal breadcrumb and with all fields
    expect(() =>
      service.addBreadcrumb({ category: "test", message: "crumb" }),
    ).not.toThrow()
  })

  it("startTransaction returns a noop transaction", () => {
    // Test that the returned transaction has the expected methods and no error thrown
    const tx = service.startTransaction({ name: "test", op: "test.op" })
    expect(tx).toBeDefined()
    expect(() => tx.finish()).not.toThrow()
    expect(() => tx.setStatus("ok")).not.toThrow()
  })

  it("setTag does not throw an error", () => {
    // Test that setting a tag does not throw an error
    expect(() => service.setTag("key", "value")).not.toThrow()
  })

  it("setContext does not throw an error", () => {
    // Test that setting context does not throw an error
    expect(() => service.setContext("ctx", { a: 1 })).not.toThrow()
  })
})
