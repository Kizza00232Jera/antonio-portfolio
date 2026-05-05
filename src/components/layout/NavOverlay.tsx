'use client'

import { useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { gsap } from 'gsap'
import { useMenu } from '@/contexts/MenuContext'
import { CharRevealLink } from '@/components/ui/CharReveal'

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
  const imageRef = useRef<HTMLDivElement>(null)

  // Close menu on route change (browser back/forward, link click)
  useEffect(() => {
    close()
  }, [pathname, close])

  // Escape key closes menu
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) close()
    },
    [isOpen, close],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // GSAP entry/exit animations for overlay contents
  useEffect(() => {
    const overlay = overlayRef.current
    if (!overlay) return

    const links = linksRef.current?.querySelectorAll('li')
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (isOpen) {
      gsap.set(overlay, { visibility: 'visible' })

      if (prefersReduced) {
        gsap.set([links, imageRef.current], { opacity: 1 })
        if (links) gsap.set(links, { x: 0 })
        return
      }

      // Stagger nav links in from the left
      gsap.fromTo(
        links ?? [],
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out', delay: 0.15 },
      )

      // Image fades in
      gsap.fromTo(
        imageRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.7, delay: 0.2, ease: 'power2.out' },
      )
    } else {
      if (prefersReduced) {
        gsap.set(overlay, { visibility: 'hidden' })
        gsap.set([links, imageRef.current], { opacity: 0 })
        return
      }

      // Fade everything out, then hide the overlay
      gsap.to([links ? Array.from(links) : [], imageRef.current].flat(), {
        opacity: 0,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => {
          gsap.set(overlay, { visibility: 'hidden' })
        },
      })
    }
  }, [isOpen])

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-[#080c18]"
      style={{ visibility: 'hidden' }}
      aria-hidden={!isOpen}
    >
      {/* Content: links over the image */}
      <div className="relative flex h-full flex-col">
        {/* Nav links — positioned over the image */}
        <nav
          aria-label="Main navigation"
          className="relative z-10 px-10 pt-28 md:px-16 md:pt-20"
        >
          <ul ref={linksRef} className="m-0 flex list-none flex-col gap-6 p-0 md:gap-4">
            {navLinks.map(({ href, label }) => {
              const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
              return (
                <li key={href} className="opacity-0">
                  <CharRevealLink
                    href={href}
                    label={label}
                    isActive={isActive}
                    tabIndex={isOpen ? 0 : -1}
                    className="text-2xl md:text-3xl font-heading"
                  />
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Scenic image — fills the bottom area, blends into dark bg */}
        <div
          ref={imageRef}
          className="mt-auto overflow-hidden opacity-0"
        >
          <Image
            src="/images/nav-scenic.jpg"
            alt="Scenic landscape"
            width={1600}
            height={900}
            className="w-full object-cover"
            style={{
              maxHeight: '55vh',
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 30%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 30%)',
            }}
            priority={false}
          />
        </div>
      </div>
    </div>
  )
}
