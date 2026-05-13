'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import { usePathname } from 'next/navigation'
import { gsap } from 'gsap'
import { useMenu } from '@/contexts/MenuContext'
import { SmartNavLink } from '@/components/ui/SmartNavLink'
import { CvModal } from '@/components/ui/CvModal'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/projects', label: 'Projects' },
  { href: '/blog', label: 'Blog' },
  { href: '/#contact', label: 'Contact' },
]

export function NavOverlay() {
  const { isOpen, close } = useMenu()
  const pathname = usePathname()
  const overlayRef = useRef<HTMLDivElement>(null)
  const linksRef = useRef<HTMLUListElement>(null)
  const footerRef = useRef<HTMLDivElement>(null)
  const [cvOpen, setCvOpen] = useState(false)

  // Freeze the active-state snapshot to when the menu opened.
  // This prevents brackets from jumping to the new page during the close animation.
  const pathnameRef = useRef(pathname)
  pathnameRef.current = pathname
  const [displayPathname, setDisplayPathname] = useState(pathname)
  useEffect(() => {
    if (isOpen) setDisplayPathname(pathnameRef.current)
  }, [isOpen]) // intentionally only isOpen — captures pathname at open time

  useEffect(() => { close() }, [pathname, close])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) close() },
    [isOpen, close],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    const overlay = overlayRef.current
    if (!overlay) return
    const links = linksRef.current?.querySelectorAll('li')
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (isOpen) {
      gsap.set(overlay, { visibility: 'visible' })

      if (prefersReduced) {
        if (links) gsap.set(links, { opacity: 1, x: 0 })
        gsap.set(footerRef.current, { opacity: 1 })
        return
      }

      gsap.fromTo(
        links ?? [],
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out', delay: 0.15 },
      )
      gsap.fromTo(
        footerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5, delay: 0.55, ease: 'power2.out' },
      )
    } else {
      if (prefersReduced) {
        gsap.set(overlay, { visibility: 'hidden' })
        if (links) gsap.set(links, { opacity: 0 })
        gsap.set(footerRef.current, { opacity: 0 })
        return
      }

      const targets = [
        ...(links ? Array.from(links) : []),
        footerRef.current,
      ].filter(Boolean)

      gsap.to(targets, {
        opacity: 0,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => { gsap.set(overlay, { visibility: 'hidden' }) },
      })
    }
  }, [isOpen])

  return (
    <>
      <div
        ref={overlayRef}
        className="fixed inset-0 z-40 flex flex-col bg-black"
        style={{ visibility: 'hidden' }}
        aria-hidden={!isOpen}
      >
        <nav
          aria-label="Main navigation"
          className="px-8 pt-28 md:px-16 md:pt-20"
          style={{ '--cr-hover': '#eef0f6' } as React.CSSProperties}
        >
          <ul ref={linksRef} className="m-0 list-none p-0">
            {navLinks.map(({ href, label }, i) => {
              const isActive = href === '/' ? displayPathname === '/' : displayPathname.startsWith(href)
              return (
                <li
                  key={href}
                  className="flex items-center justify-between border-t border-white/10 py-5 opacity-0"
                >
                  <div className="flex items-center gap-2">
                    {isActive && (
                      <span className="font-heading text-3xl tracking-wide text-[#eef0f6] md:text-4xl">[</span>
                    )}
                    <SmartNavLink
                      href={href}
                      label={label}
                      tabIndex={isOpen ? 0 : -1}
                      className="text-3xl font-heading tracking-wide md:text-4xl"
                      onBeforeScroll={close}
                    />
                    {isActive && (
                      <span className="font-heading text-3xl tracking-wide text-[#eef0f6] md:text-4xl">]</span>
                    )}
                  </div>
                  <span className="font-mono text-xs tracking-widest text-white/20">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </li>
              )
            })}

            <li className="flex items-center justify-between border-b border-t border-white/10 py-5 opacity-0">
              <button
                tabIndex={isOpen ? 0 : -1}
                onClick={() => { close(); setCvOpen(true) }}
                className="char-reveal text-3xl font-heading tracking-wide md:text-4xl"
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  '--cr-color': '#eef0f6',
                  '--cr-hover': '#eef0f6',
                } as React.CSSProperties}
              >
                {Array.from('MY  CV  ↗').map((char, i) =>
                  char === ' ' ? (
                    <span key={i} style={{ display: 'inline-block', width: '0.3em' }} />
                  ) : (
                    <span key={i} data-char={char} style={{ '--index': i } as React.CSSProperties}>
                      {char}
                    </span>
                  )
                )}
              </button>
              <span className="font-mono text-xs tracking-widest text-white/20">
                {String(navLinks.length + 1).padStart(2, '0')}
              </span>
            </li>
          </ul>
        </nav>

        <div
          ref={footerRef}
          className="mt-auto flex items-end justify-between px-8 pb-10 opacity-0 md:px-16"
        >
          <span className="font-mono text-xs uppercase tracking-widest text-white/30">
            Based in Stockholm, Sweden
          </span>
          <span className="font-mono text-xs tracking-widest text-white/20">
            © {new Date().getFullYear()}
          </span>
        </div>
      </div>

      <CvModal isOpen={cvOpen} onClose={() => setCvOpen(false)} />
    </>
  )
}
