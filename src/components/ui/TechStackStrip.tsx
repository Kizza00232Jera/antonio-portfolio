'use client'

import Image from 'next/image'
import { urlFor } from '@/lib/sanity/image'
import type { TechStackItem } from '@/lib/sanity/types'
import { cn } from '@/utils/cn'

interface TechStackStripProps {
  items: TechStackItem[]
  className?: string
}

/**
 * Compact single-line tech-stack marquee for project cards. Keeps the row to
 * one line and scrolls horizontally so cards with many techs stay the same
 * height as cards with few — titles, images and descriptions line up across
 * the grid instead of being pushed around by a wrapping badge list.
 */
export function TechStackStrip({ items, className }: TechStackStripProps) {
  if (!items || items.length === 0) return null

  // Repeat enough times that one copy always overflows a narrow card, so the
  // loop is seamless. Translating by one copy's width = -(100 / copies)%.
  const copies = Math.max(2, Math.ceil(12 / items.length))
  const repeated = Array.from({ length: copies }, () => items).flat()
  const translateEnd = `${-(100 / copies)}%`

  return (
    <div className={cn('tech-strip relative overflow-hidden', className)}>
      <div
        className="flex w-max items-center gap-4 whitespace-nowrap"
        style={{
          animation: 'marquee-scroll 24s linear infinite',
          ['--marquee-end' as string]: translateEnd,
        }}
      >
        {repeated.map((tech, i) => (
          <span
            key={`${tech._id}-${i}`}
            className="flex shrink-0 items-center gap-1.5 font-ui text-xs text-text-muted md:text-sm"
          >
            {tech.icon && (
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-white/10 bg-[#eef0f6] p-0.5">
                <Image
                  src={urlFor(tech.icon).width(28).height(28).url()}
                  alt={tech.name}
                  width={28}
                  height={28}
                  className="h-3.5 w-3.5 object-contain"
                />
              </span>
            )}
            {tech.name}
          </span>
        ))}
      </div>
    </div>
  )
}
