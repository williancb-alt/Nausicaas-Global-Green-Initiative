export const config = {
  env:
    (import.meta.env.VITE_ENVIRONMENT as string | undefined) ??
    import.meta.env.MODE,
  isProd: import.meta.env.PROD,
  isDev: import.meta.env.DEV,
  appVersion: import.meta.env.VITE_APP_VERSION as string | undefined,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  sentryDsn: import.meta.env.VITE_SENTRY_UI_DSN as string | undefined,
} as const
