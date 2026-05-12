'use client'

import Link from 'next/link'
import { cn } from '@/utils/cn'

function CharRevealChars({ text }: { text: string }) {
  return (
    <>
      {Array.from(text).map((char, i) => (
        <span
          key={i}
          data-char={char}
          style={{ '--index': i } as React.CSSProperties}
        >
          {char}
        </span>
      ))}
    </>
  )
}

export function CharRevealText({ text, className }: { text: string; className?: string }) {
  return (
    <span className={cn('char-reveal', className)}>
      <CharRevealChars text={text} />
    </span>
  )
}

interface CharRevealLinkProps {
  href: string
  label: string
  isActive?: boolean
  tabIndex?: number
  className?: string
}

export function CharRevealLink({ href, label, isActive, tabIndex, className }: CharRevealLinkProps) {
  return (
    <Link
      href={href}
      tabIndex={tabIndex}
      className={cn('char-reveal', isActive && 'char-reveal--active', className)}
    >
      <CharRevealChars text={label} />
    </Link>
  )
}
