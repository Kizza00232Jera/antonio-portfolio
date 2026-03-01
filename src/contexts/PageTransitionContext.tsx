'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import { useRouter, usePathname } from 'next/navigation'

/* ── Route → typing label ─────────────────────────────────── */

const ROUTE_LABELS: Record<string, string> = {
  '/': 'Antonio.',
  '/projects': 'Projects.',
  '/blog': 'Blog.',
}

/** Returns the typing label for a path, or null for slug routes that skip the transition */
export function getLabelForPath(path: string): string | null {
  return ROUTE_LABELS[path] ?? null
}

/* ── Types ─────────────────────────────────────────────────── */

export interface NavigationRequest {
  path: string
  label: string
}

interface PageTransitionContextValue {
  /** Request a page transition to the given path */
  navigateTo: (path: string) => void
  /** Whether a transition is currently running */
  isTransitioning: boolean
  /** The pending navigation request (consumed by PageTransition) */
  navigationRequest: NavigationRequest | null
  /** Called by PageTransition when the full sequence finishes */
  completeTransition: () => void
}

/* ── Context ──────────────────────────────────────────────── */

const PageTransitionContext = createContext<PageTransitionContextValue | null>(null)

/* ── Provider ─────────────────────────────────────────────── */

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [navigationRequest, setNavigationRequest] = useState<NavigationRequest | null>(null)

  // Ref mirrors isTransitioning to avoid stale closure in navigateTo
  const transitioningRef = useRef(false)

  const navigateTo = useCallback(
    (path: string) => {
      // Already mid-transition — ignore
      if (transitioningRef.current) return
      // Same page — ignore
      if (path === pathname) return

      const label = getLabelForPath(path)

      // Slug routes bypass the curtain entirely
      if (!label) {
        router.push(path)
        return
      }

      transitioningRef.current = true
      setIsTransitioning(true)
      setNavigationRequest({ path, label })
    },
    [pathname, router],
  )

  const completeTransition = useCallback(() => {
    transitioningRef.current = false
    setIsTransitioning(false)
    setNavigationRequest(null)
  }, [])

  return (
    <PageTransitionContext.Provider
      value={{
        navigateTo,
        isTransitioning,
        navigationRequest,
        completeTransition,
      }}
    >
      {children}
    </PageTransitionContext.Provider>
  )
}

/* ── Hook ─────────────────────────────────────────────────── */

export function usePageTransition() {
  const ctx = useContext(PageTransitionContext)
  if (!ctx) {
    throw new Error('usePageTransition must be used within a PageTransitionProvider')
  }
  return ctx
}
