import { describe, it, expect, vi, beforeEach } from "vitest"
import * as Sentry from "@sentry/react"
import { createSentryMonitoringService } from "./sentryMonitoring"
import type { SentryConfig } from "./sentryMonitoring"

// Mock the package
vi.mock("@sentry/react", () => ({
  init: vi.fn(),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  setUser: vi.fn(),
  addBreadcrumb: vi.fn(),
  setTag: vi.fn(),
  setContext: vi.fn(),
  startInactiveSpan: vi.fn(),
  reactRouterV7BrowserTracingIntegration: vi.fn(() => "router-tracing"),
  browserProfilingIntegration: vi.fn(() => "profiling"),
  replayIntegration: vi.fn(() => "replay"),
  breadcrumbsIntegration: vi.fn(() => "breadcrumbs"),
  httpClientIntegration: vi.fn(() => "http-client"),
}))

// Mock react-router-dom hooks used by the Sentry integration
vi.mock("react-router-dom", () => ({
  useLocation: vi.fn(),
  useNavigationType: vi.fn(),
  createRoutesFromChildren: vi.fn(),
  matchRoutes: vi.fn(),
}))

// Base config for tests
const baseConfig: SentryConfig = {
  dsn: "https://key@sentry.io/123",
  environment: "test",
}

describe("createSentryMonitoringService", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("calls Sentry.init with the provided config", () => {
    // Validate that Sentry.init is called with the correct configuration
    createSentryMonitoringService(baseConfig)

    expect(Sentry.init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: "https://key@sentry.io/123",
        environment: "test",
        sendDefaultPii: false,
      }),
    )
  })

  it("applies default sample rates when not provided", () => {
    createSentryMonitoringService(baseConfig)

    // Validate that default sample rates are applied
    // when not specified in config
    expect(Sentry.init).toHaveBeenCalledWith(
      expect.objectContaining({
        tracesSampleRate: 1.0,
        profileSessionSampleRate: 1.0,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
        debug: false,
      }),
    )
  })

  it("uses provided sample rates over defaults", () => {
    createSentryMonitoringService({
      ...baseConfig,
      tracesSampleRate: 0.5,
      replaysSessionSampleRate: 0.3,
      debug: true,
    })

    // Validate that provided sample rates
    // override defaults
    expect(Sentry.init).toHaveBeenCalledWith(
      expect.objectContaining({
        tracesSampleRate: 0.5,
        replaysSessionSampleRate: 0.3,
        debug: true,
      }),
    )
  })

  it("configures replay integration with privacy settings", () => {
    createSentryMonitoringService(baseConfig)

    // Validate that replay integration is configured
    // with expected settings
    expect(Sentry.replayIntegration).toHaveBeenCalledWith({
      maskAllText: false,
      maskAllInputs: true,
      blockAllMedia: false,
    })
  })

  describe("returned service", () => {
    it("captureException calls Sentry without context", () => {
      const service = createSentryMonitoringService(baseConfig)
      const error = new Error("test")

      // Trigger the method and validate it calls Sentry.captureException
      service.captureException(error)

      expect(Sentry.captureException).toHaveBeenCalledWith(error)
    })

    it("captureException calls Sentry with context", () => {
      const service = createSentryMonitoringService(baseConfig)
      const error = new Error("test")
      const context = { key: "value" }

      // Trigger the method and validate it calls Sentry.captureException with context
      service.captureException(error, context)

      expect(Sentry.captureException).toHaveBeenCalledWith(error, {
        extra: context,
      })
    })

    it("captureMessage calls Sentry without level", () => {
      const service = createSentryMonitoringService(baseConfig)

      service.captureMessage("hello")

      expect(Sentry.captureMessage).toHaveBeenCalledWith("hello", undefined)
    })

    it("captureMessage calls Sentry with level", () => {
      const service = createSentryMonitoringService(baseConfig)

      service.captureMessage("hello", "warning")

      expect(Sentry.captureMessage).toHaveBeenCalledWith("hello", "warning")
    })

    it("setUser calls Sentry", () => {
      // Make sure that setUser calls Sentry.setUser
      // with the provided user info
      const service = createSentryMonitoringService(baseConfig)
      const user = { id: "1", email: "a@b.com" }

      service.setUser(user)

      expect(Sentry.setUser).toHaveBeenCalledWith(user)
    })

    it("setUser with null clears user", () => {
      // Validate that calling setUser with null
      // clears the user in Sentry
      const service = createSentryMonitoringService(baseConfig)

      service.setUser(null)

      expect(Sentry.setUser).toHaveBeenCalledWith(null)
    })

    it("addBreadcrumb calls Sentry with all fields", () => {
      const service = createSentryMonitoringService(baseConfig)

      service.addBreadcrumb({
        category: "http",
        message: "request",
        level: "info",
        data: { status: 200 },
      })

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        category: "http",
        message: "request",
        level: "info",
        data: { status: 200 },
      })
    })

    it("addBreadcrumb omits optional fields when not provided", () => {
      const service = createSentryMonitoringService(baseConfig)

      service.addBreadcrumb({ category: "nav", message: "click" })

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        category: "nav",
        message: "click",
      })
    })

    it("setTag calls Sentry", () => {
      const service = createSentryMonitoringService(baseConfig)

      service.setTag("user.role", "admin")

      expect(Sentry.setTag).toHaveBeenCalledWith("user.role", "admin")
    })

    it("setContext calls Sentry", () => {
      const service = createSentryMonitoringService(baseConfig)
      const ctx = { page: "dashboard" }

      service.setContext("app", ctx)

      expect(Sentry.setContext).toHaveBeenCalledWith("app", ctx)
    })
  })
})
