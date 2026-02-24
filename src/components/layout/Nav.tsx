'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRef } from 'react'
import { gsap } from 'gsap'
import { cn } from '@/utils/cn'

const links = [
  { href: '/', label: 'Home' },
  { href: '/projects', label: 'Projects' },
  { href: '/blog', label: 'Blog' },
]

export default function Nav() {
  const pathname = usePathname()
  const wrapperRef = useRef<HTMLElement | null>(null)

  function handleNavClick() {
    // Grab the page wrapper element (set by layout) for the 3D tilt effect
    const pageWrapper = document.getElementById('page-wrapper')
    if (!pageWrapper) return

    const tl = gsap.timeline()
    tl.to(pageWrapper, {
      rotateX: 3,
      rotateY: -2,
      scale: 0.98,
      transformPerspective: 1200,
      transformOrigin: 'center center',
      duration: 0.25,
      ease: 'power2.in',
    }).to(pageWrapper, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      duration: 0.45,
      ease: 'power2.out',
    })
  }

  return (
    <nav ref={wrapperRef} aria-label="Main navigation">
      <ul className="flex items-center gap-8 list-none m-0 p-0">
        {links.map(({ href, label }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={handleNavClick}
                className={cn(
                  'text-sm font-body font-medium tracking-wide transition-colors duration-200',
                  isActive
                    ? 'text-accent'
                    : 'text-text-muted hover:text-text'
                )}
              >
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
