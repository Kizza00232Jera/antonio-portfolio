'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Defer init to idle so analytics never competes with hydration / LCP on
    // slow connections. disable_surveys stops the ~32 KB surveys.js bundle we
    // don't use from loading.
    const start = () => {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        person_profiles: 'identified_only',
        capture_pageview: false, // handled manually via usePathname to support SPA navigation
        disable_surveys: true,
      })
      // Tag every event so this project is identifiable in the shared PostHog workspace
      posthog.register({ project: 'antonio-portfolio' })
    }

    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number }
    if (typeof w.requestIdleCallback === 'function') {
      w.requestIdleCallback(start)
    } else {
      setTimeout(start, 2000)
    }
  }, [])

  return <PHProvider client={posthog}>{children}</PHProvider>
}
