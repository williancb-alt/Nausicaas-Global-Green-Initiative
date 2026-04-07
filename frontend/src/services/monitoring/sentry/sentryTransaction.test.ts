import { describe, it, expect, vi, beforeEach } from "vitest"
import * as Sentry from "@sentry/react"
import { SentryTransaction } from "./sentryTransaction"

// Mock Sentry's init and startInactiveSpan functions
vi.mock("@sentry/react", () => ({
  startInactiveSpan: vi.fn(),
}))

describe("SentryTransaction", () => {
  // Mock span to use in tests
  const mockSpan = {
    end: vi.fn(),
    setStatus: vi.fn(),
  }

  // Mock sentry monitoring service to return the mock span
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(Sentry.startInactiveSpan).mockReturnValue(
      mockSpan as unknown as Sentry.Span,
    )
  })

  it("creates an inactive span with the provided context", () => {
    // Validate that the transaction is created with the correct context
    new SentryTransaction({ name: "load-page", op: "ui.render" })

    expect(Sentry.startInactiveSpan).toHaveBeenCalledWith({
      name: "load-page",
      op: "ui.render",
      attributes: undefined,
    })
  })

  it("data passed as span attributes", () => {
    // Make sure data passed as expected
    new SentryTransaction({
      name: "api-call",
      op: "http",
      data: { url: "/api/grants" },
    })

    expect(Sentry.startInactiveSpan).toHaveBeenCalledWith({
      name: "api-call",
      op: "http",
      attributes: { url: "/api/grants" },
    })
  })

  it("finish ends the span", () => {
    // Validate that finish calls end on the span
    const tx = new SentryTransaction({ name: "test", op: "test" })

    tx.finish()

    expect(mockSpan.end).toHaveBeenCalled()
  })

  it("setStatus sets ok status with code 1", () => {
    // Validate that setStatus sets the correct status on the span
    const tx = new SentryTransaction({ name: "test", op: "test" })

    tx.setStatus("ok")

    expect(mockSpan.setStatus).toHaveBeenCalledWith({
      code: 1,
      message: "ok",
    })
  })

  it("setStatus sets error status with code 2", () => {
    // Validate that setStatus sets the correct error status on the span
    const tx = new SentryTransaction({ name: "test", op: "test" })

    tx.setStatus("error")

    expect(mockSpan.setStatus).toHaveBeenCalledWith({
      code: 2,
      message: "error",
    })
  })

  it("handles undefined span gracefully", () => {
    // Validate that methods do not throw if span is undefined
    vi.mocked(Sentry.startInactiveSpan).mockReturnValue(
      undefined as unknown as Sentry.Span,
    )

    const tx = new SentryTransaction({ name: "test", op: "test" })

    expect(() => tx.finish()).not.toThrow()
    expect(() => tx.setStatus("ok")).not.toThrow()
  })
})
