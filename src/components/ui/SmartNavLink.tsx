'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/utils/cn'

function CharRevealChars({ text }: { text: string }) {
  return (
    <>
      {Array.from(text).map((char, i) => (
        <span key={i} data-char={char} style={{ '--index': i } as React.CSSProperties}>
          {char}
        </span>
      ))}
    </>
  )
}

interface SmartNavLinkProps {
  href: string
  label: string
  className?: string
  isActive?: boolean
  tabIndex?: number
  /** Called before smooth-scrolling — use to close mobile menu */
  onBeforeScroll?: () => void
}

export function SmartNavLink({
  href,
  label,
  className,
  isActive,
  tabIndex,
  onBeforeScroll,
}: SmartNavLinkProps) {
  const pathname = usePathname()

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== '/') return

    if (href === '/') {
      e.preventDefault()
      onBeforeScroll?.()
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    if (href === '/#contact') {
      e.preventDefault()
      onBeforeScroll?.()
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <Link
      href={href}
      tabIndex={tabIndex}
      onClick={handleClick}
      className={cn('char-reveal', isActive && 'char-reveal--active', className)}
    >
      <CharRevealChars text={label} />
    </Link>
  )
}
