import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock config to control environment variables for testing
vi.mock("../../config", () => ({
  config: {
    env: "test",
    isProd: false,
    isDev: false,
    appVersion: "1.0.0",
    apiBaseUrl: "http://localhost",
    sentryDsn: undefined as string | undefined,
  },
}))

// Mock sentry
const mockSentryService = {
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  setUser: vi.fn(),
  addBreadcrumb: vi.fn(),
  startTransaction: vi.fn(),
  setTag: vi.fn(),
  setContext: vi.fn(),
}

// Mock the Sentry monitoring service to return the mock service instance
vi.mock("./sentry/sentryMonitoring", () => ({
  createSentryMonitoringService: vi.fn(() => mockSentryService),
}))

describe("monitoring index", () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it("returns NoopMonitoringService by default when no DSN is set", async () => {
    // Ensure config has no DSN
    const { getMonitoring } = await import("./index")
    const monitoring = getMonitoring()
    expect(monitoring.constructor.name).toBe("NoopMonitoringService")
  })

  it("initialises Sentry service when DSN is configured", async () => {
    // Validate that Sentry is initialised with the correct config when DSN is set
    const { config } = await import("../../config")
    ;(config as { sentryDsn: string | undefined }).sentryDsn =
      "https://key@sentry.io/123"

    const { initMonitoring, getMonitoring } = await import("./index")
    const { createSentryMonitoringService } =
      await import("./sentry/sentryMonitoring")

    initMonitoring()

    expect(createSentryMonitoringService).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: "https://key@sentry.io/123",
        environment: "test",
        release: "1.0.0",
      }),
    )
    expect(getMonitoring()).toBe(mockSentryService)
  })

  it("does not initialise Sentry when DSN is empty", async () => {
    // When DSN is not set, initMonitoring should not initialise Sentry
    // and getMonitoring should return NoopMonitoringService
    const { config } = await import("../../config")
    ;(config as { sentryDsn: string | undefined }).sentryDsn = undefined

    const { initMonitoring, getMonitoring } = await import("./index")
    const { createSentryMonitoringService } =
      await import("./sentry/sentryMonitoring")

    initMonitoring()

    expect(createSentryMonitoringService).not.toHaveBeenCalled()
    expect(getMonitoring().constructor.name).toBe("NoopMonitoringService")
  })

  it("passes production sample rates when isProd is true", async () => {
    // Validate expected settings per env
    const { config } = await import("../../config")
    const mutableConfig = config as {
      sentryDsn: string | undefined
      isProd: boolean
      isDev: boolean
    }
    mutableConfig.sentryDsn = "https://key@sentry.io/123"
    mutableConfig.isProd = true
    mutableConfig.isDev = false

    const { initMonitoring } = await import("./index")
    const { createSentryMonitoringService } =
      await import("./sentry/sentryMonitoring")

    initMonitoring()

    expect(createSentryMonitoringService).toHaveBeenCalledWith(
      expect.objectContaining({
        tracesSampleRate: 0.2,
        profileSessionSampleRate: 0.1,
        replaysSessionSampleRate: 0.1,
        debug: false,
      }),
    )
  })
})
