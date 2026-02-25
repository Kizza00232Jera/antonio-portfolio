'use client'

import type { Tag } from '@/lib/sanity/types'
import { cn } from '@/utils/cn'

interface ProjectFilterBarProps {
  tags: Tag[]
  activeTag: string | null
  onTagChange: (tagSlug: string | null) => void
}

export function ProjectFilterBar({
  tags,
  activeTag,
  onTagChange,
}: ProjectFilterBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-bg/80 backdrop-blur-md">
      <div className="scrollbar-hide flex items-center gap-6 overflow-x-auto px-6 py-3 md:px-10">
        <span className="shrink-0 font-mono text-xs uppercase tracking-widest text-text-muted">
          Filter
        </span>

        {/* "All" option */}
        <button
          type="button"
          onClick={() => onTagChange(null)}
          className="flex shrink-0 items-center gap-2 font-mono text-xs uppercase tracking-wider text-text-muted transition-colors hover:text-text"
        >
          <span
            className={cn(
              'h-2.5 w-2.5 rounded-full border transition-colors',
              activeTag === null
                ? 'border-accent bg-accent'
                : 'border-text-muted',
            )}
          />
          All
        </button>

        {tags.map((tag) => (
          <button
            key={tag._id}
            type="button"
            onClick={() => onTagChange(tag.slug.current)}
            className="flex shrink-0 items-center gap-2 font-mono text-xs uppercase tracking-wider text-text-muted transition-colors hover:text-text"
          >
            <span
              className={cn(
                'h-2.5 w-2.5 rounded-full border transition-colors',
                activeTag === tag.slug.current
                  ? 'border-accent bg-accent'
                  : 'border-text-muted',
              )}
            />
            {tag.name}
          </button>
        ))}
      </div>
    </div>
  )
}
