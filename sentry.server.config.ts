import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  tracesSampleRate: 0.1,

  // Only send errors from Vercel production deployment (master branch)
  enabled: process.env.VERCEL_ENV === 'production',
})
