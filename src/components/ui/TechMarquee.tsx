'use client'

import Image from 'next/image'
import { urlFor } from '@/lib/sanity/image'
import type { TechStackItem } from '@/lib/sanity/types'
import { cn } from '@/utils/cn'

interface TechMarqueeProps {
  items: TechStackItem[]
  className?: string
}

export function TechMarquee({ items, className }: TechMarqueeProps) {
  if (items.length === 0) return null

  // Duplicate items for seamless infinite loop
  const doubled = [...items, ...items]

  return (
    <div className={cn('overflow-hidden border-y border-border py-4', className)}>
      <div
        className="marquee-track flex gap-10 whitespace-nowrap"
        style={{
          animation: 'marquee-scroll 25s linear infinite',
          width: 'max-content',
        }}
      >
        {doubled.map((item, i) => (
          <div
            key={`${item._id}-${i}`}
            className="flex items-center gap-3 px-2"
          >
            {item.icon && (
              <Image
                src={urlFor(item.icon).width(40).height(40).url()}
                alt={item.name}
                width={40}
                height={40}
                className="h-8 w-8 object-contain"
              />
            )}
            <span className="font-mono text-sm uppercase tracking-wider text-text-muted">
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
