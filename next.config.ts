import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
  /* config options here */
}

export default withSentryConfig(nextConfig, {
  // Suppress Sentry CLI output during builds
  silent: true,

  // Disable source map upload (no SENTRY_AUTH_TOKEN configured)
  sourcemaps: {
    disable: true,
  },
})
