import React from "react"
import * as Sentry from "@sentry/react"
import {
  useLocation,
  useNavigationType,
  createRoutesFromChildren,
  matchRoutes,
} from "react-router-dom"

import type {
  Breadcrumb,
  MonitoringService,
  MonitoringUser,
  SeverityLevel,
} from "../types"
import { SentryTransaction } from "./sentryTransaction"

export type SentryConfig = {
  dsn: string
  environment: string
  release?: string
  tracesSampleRate?: number
  profileSessionSampleRate?: number
  replaysSessionSampleRate?: number
  replaysOnErrorSampleRate?: number
  debug?: boolean
}

function toSentrySeverity(
  level: SeverityLevel,
): "fatal" | "error" | "warning" | "info" | "debug" {
  return level
}

// Factory function that creates
// Sentry-based monitoring service
export function createSentryMonitoringService(
  config: SentryConfig,
): MonitoringService {
  Sentry.init({
    dsn: config.dsn,
    environment: config.environment,
    release: config.release,
    integrations: [
      Sentry.reactRouterV7BrowserTracingIntegration({
        useEffect: React.useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),
      Sentry.browserProfilingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        maskAllInputs: true,
        blockAllMedia: false,
      }),
      Sentry.breadcrumbsIntegration({
        console: true,
        dom: true,
        fetch: true,
        history: true,
        xhr: true,
      }),
      Sentry.httpClientIntegration(),
    ],
    tracesSampleRate: config.tracesSampleRate ?? 1.0,
    profileSessionSampleRate: config.profileSessionSampleRate ?? 1.0,
    replaysSessionSampleRate: config.replaysSessionSampleRate ?? 0.1,
    replaysOnErrorSampleRate: config.replaysOnErrorSampleRate ?? 1.0,
    sendDefaultPii: false,
    debug: config.debug ?? false,
  })

  return {
    // Capture exception with optional context
    captureException(error: unknown, context?: Record<string, unknown>): void {
      if (context) {
        Sentry.captureException(error, { extra: context })
      } else {
        Sentry.captureException(error)
      }
    },

    // Capture message with optional severity level
    captureMessage(message: string, level?: SeverityLevel): void {
      Sentry.captureMessage(
        message,
        level ? toSentrySeverity(level) : undefined,
      )
    },

    // Set user context for monitoring
    setUser(user: MonitoringUser | null): void {
      Sentry.setUser(user)
    },

    // Add a breadcrumb to Sentry with optional level and data
    addBreadcrumb(breadcrumb: Breadcrumb): void {
      const crumb: Sentry.Breadcrumb = {
        category: breadcrumb.category,
        message: breadcrumb.message,
      }
      if (breadcrumb.level) crumb.level = toSentrySeverity(breadcrumb.level)
      if (breadcrumb.data) crumb.data = breadcrumb.data
      Sentry.addBreadcrumb(crumb)
    },

    // Start a transaction with the given context
    startTransaction(context) {
      return new SentryTransaction(context)
    },

    // Set a tag in Sentry for additional context
    setTag(key: string, value: string): void {
      Sentry.setTag(key, value)
    },

    // Set context in Sentry
    setContext(name: string, context: Record<string, unknown>): void {
      Sentry.setContext(name, context)
    },
  }
}
