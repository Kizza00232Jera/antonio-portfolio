'use client'

import { useEffect } from 'react'

/**
 * Watches which `[data-theme]` section overlaps the header
 * and sets `data-theme` on the `<header>` element so its
 * text color adapts (MENU + A.J. switch between light/dark).
 */
export default function ThemeObserver() {
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-theme]'))
    const header = document.querySelector('header')
    if (!header || sections.length === 0) return

    // Frozen (sticky/pinned) sections stay in the strip while later sections
    // slide over them, so several can intersect at once. Track them all and
    // use the last one in DOM order — that's the one painted on top.
    const intersecting = new Set<HTMLElement>()

    // Observe a thin strip at the top of the viewport (~5%)
    // so only the section behind the header triggers the switch.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement
          if (entry.isIntersecting) intersecting.add(el)
          else intersecting.delete(el)
        }
        for (let i = sections.length - 1; i >= 0; i--) {
          if (intersecting.has(sections[i])) {
            const theme = sections[i].dataset.theme
            if (theme) header.dataset.headerTheme = theme
            break
          }
        }
      },
      { rootMargin: '0px 0px -95% 0px' },
    )

    sections.forEach((s) => observer.observe(s))
    return () => {
      observer.disconnect()
      if (header) delete header.dataset.headerTheme
    }
  }, [])

  return null
}
