import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  tracesSampleRate: 0.1,

  // Disable in development
  enabled: process.env.NODE_ENV === 'production',
})
