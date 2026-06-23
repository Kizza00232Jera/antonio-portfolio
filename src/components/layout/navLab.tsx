'use client'

/**
 * NAV LAB — temporary prototyping harness for nav readability.
 *
 * Lets you flip the live Header between the current design (0) and four
 * prototype behaviours (1-4) on any real page. State persists in
 * localStorage and is also settable via ?nav=N. The switcher widget only
 * renders in development, so this never ships to production.
 *
 * To remove later: delete this file, the <NavLabProvider>/<NavLabSwitcher>
 * mounts in (site)/layout.tsx, the `.header-root[data-variant=…]` CSS block
 * in globals.css, and the useNavLab/useHeaderScroll wiring in Header.tsx.
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

export type NavVariant = 0 | 1 | 2 | 3 | 4 | 5

export const NAV_VARIANTS: Array<{
  id: NavVariant
  name: string
  blurb: string
}> = [
  { id: 0, name: 'Current', blurb: 'Fixed bar, mix-blend-difference (baseline)' },
  // 1–5 all auto-hide on scroll-down / reveal on scroll-up. They differ only
  // in the BACKGROUND the revealed bar gets so it never merges with content.
  { id: 1, name: 'Auto-hide · Solid', blurb: 'Reveals as an opaque bar with a hairline underline' },
  { id: 2, name: 'Auto-hide · Frosted', blurb: 'Reveals as a translucent blurred glass bar' },
  { id: 3, name: 'Auto-hide · Pill', blurb: 'Reveals as a compact centred glass capsule' },
  { id: 4, name: 'Auto-hide · Gradient + cue', blurb: 'Soft top gradient scrim; corner menu button stays while hidden' },
  { id: 5, name: 'Auto-hide · Underline + cue', blurb: 'Opaque bar w/ accent underline; hover/tap a top handle to peek' },
]

const STORAGE_KEY = 'navLabVariant'

const NavLabContext = createContext<{
  variant: NavVariant
  setVariant: (v: NavVariant) => void
} | null>(null)

export function NavLabProvider({ children }: { children: ReactNode }) {
  const [variant, setVariantState] = useState<NavVariant>(0)

  // Hydrate from ?nav= or localStorage after mount (avoids SSR mismatch).
  useEffect(() => {
    const fromQuery = new URLSearchParams(window.location.search).get('nav')
    const stored = window.localStorage.getItem(STORAGE_KEY)
    const raw = fromQuery ?? stored
    const n = raw == null ? NaN : Number(raw)
    if (n >= 0 && n <= 5) setVariantState(n as NavVariant)
  }, [])

  const setVariant = (v: NavVariant) => {
    setVariantState(v)
    try {
      window.localStorage.setItem(STORAGE_KEY, String(v))
    } catch {
      /* ignore */
    }
  }

  return (
    <NavLabContext.Provider value={{ variant, setVariant }}>
      {children}
    </NavLabContext.Provider>
  )
}

export function useNavLab() {
  return useContext(NavLabContext) ?? { variant: 0 as NavVariant, setVariant: () => {} }
}

/**
 * Tracks scroll position + direction for nav behaviours.
 * `scrolled`  — past the hero strip (used by scrim / pill / collapse).
 * `hidden`    — actively scrolling down past a threshold (used by auto-hide).
 */
export function useHeaderScroll() {
  const [state, setState] = useState({ scrolled: false, hidden: false })

  useEffect(() => {
    // Poll scroll position every frame instead of relying on `scroll` events.
    // Lenis + GSAP can route scrolling in ways that don't always emit a window
    // scroll event, so a rAF read of the live position is the robust path.
    let raf = 0
    let lastY = -1
    let hidden = false

    const scrollY = () =>
      window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0

    const tick = () => {
      const y = scrollY()
      if (y !== lastY) {
        const delta = lastY < 0 ? 0 : y - lastY
        if (Math.abs(delta) > 4) hidden = delta > 0 && y > 120
        const scrolled = y > 40
        lastY = y
        setState((prev) =>
          prev.scrolled === scrolled && prev.hidden === hidden
            ? prev
            : { scrolled, hidden },
        )
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return state
}

/** Dev-only floating control to switch between nav prototypes. */
export function NavLabSwitcher() {
  const { variant, setVariant } = useNavLab()
  const [open, setOpen] = useState(true)

  if (process.env.NODE_ENV === 'production') return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1rem',
        right: '1rem',
        zIndex: 60,
        mixBlendMode: 'normal',
        fontFamily: 'ui-monospace, monospace',
      }}
    >
      {open ? (
        <div
          style={{
            width: 250,
            background: 'rgba(12,14,22,0.92)',
            color: '#eef0f6',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 12,
            padding: 12,
            backdropFilter: 'blur(12px)',
            boxShadow: '0 18px 40px -16px rgba(0,0,0,0.7)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 10, letterSpacing: '0.18em', opacity: 0.6 }}>
              NAV LAB
            </span>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#eef0f6',
                cursor: 'pointer',
                fontSize: 14,
                lineHeight: 1,
                opacity: 0.6,
              }}
              aria-label="Collapse nav lab"
            >
              ×
            </button>
          </div>
          <div
            style={{
              fontSize: 9.5,
              lineHeight: 1.4,
              opacity: 0.6,
              marginBottom: 8,
            }}
          >
            Variants 1–5 all <b>auto-hide</b>: scroll down to hide, up to reveal.
            Each reveals a different background. 4 &amp; 5 add a cue while hidden.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {NAV_VARIANTS.map((v) => {
              const active = v.id === variant
              return (
                <button
                  key={v.id}
                  onClick={() => setVariant(v.id)}
                  style={{
                    textAlign: 'left',
                    background: active ? '#3b82f6' : 'rgba(255,255,255,0.04)',
                    color: active ? '#fff' : '#cbd2e0',
                    border: '1px solid',
                    borderColor: active ? '#3b82f6' : 'rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    padding: '7px 9px',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600 }}>
                    {v.id}. {v.name}
                  </div>
                  <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2, lineHeight: 1.3 }}>
                    {v.blurb}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          style={{
            background: 'rgba(12,14,22,0.92)',
            color: '#eef0f6',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 999,
            padding: '8px 14px',
            cursor: 'pointer',
            fontSize: 11,
            letterSpacing: '0.12em',
            backdropFilter: 'blur(12px)',
          }}
        >
          NAV {variant}
        </button>
      )}
    </div>
  )
}
