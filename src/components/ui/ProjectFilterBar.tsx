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
      <div className="flex items-center gap-4 overflow-x-auto px-6 py-3 md:px-10">
        <span className="shrink-0 font-mono text-xs uppercase tracking-widest text-text-muted">
          Filter
        </span>

        <button
          type="button"
          onClick={() => onTagChange(null)}
          className={cn(
            'shrink-0 rounded-full border px-4 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors',
            activeTag === null
              ? 'border-accent bg-accent/10 text-accent'
              : 'border-border text-text-muted hover:border-text hover:text-text',
          )}
        >
          All
        </button>

        {tags.map((tag) => (
          <button
            key={tag._id}
            type="button"
            onClick={() => onTagChange(tag.slug.current)}
            className={cn(
              'shrink-0 rounded-full border px-4 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors',
              activeTag === tag.slug.current
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-border text-text-muted hover:border-text hover:text-text',
            )}
          >
            {tag.name}
          </button>
        ))}
      </div>
    </div>
  )
}
