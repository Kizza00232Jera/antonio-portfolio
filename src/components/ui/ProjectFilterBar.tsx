'use client'

import { useState } from 'react'
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
  const [isOpen, setIsOpen] = useState(false)

  const activeLabel = activeTag
    ? tags.find((t) => t.slug.current === activeTag)?.name ?? 'All'
    : 'All'

  const handleSelect = (tagSlug: string | null) => {
    onTagChange(tagSlug)
    setIsOpen(false)
  }

  return (
    <div className="relative shrink-0">
      {/* ── Mobile: collapsible expand-on-click ── */}
      <div className="lg:hidden">
        {/* Backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Expanded options panel — slides up */}
        <div
          className={cn(
            'absolute bottom-full left-0 right-0 z-40 overflow-hidden border-t border-border bg-bg transition-all duration-300 ease-out',
            isOpen ? 'max-h-[60vh] opacity-100' : 'max-h-0 opacity-0',
          )}
        >
          <div className="flex flex-col gap-1 px-6 py-4">
            <button
              type="button"
              onClick={() => handleSelect(null)}
              className="flex items-center gap-3 py-1.5 font-ui text-xs uppercase tracking-wider text-text-muted transition-colors hover:text-text"
            >
              <span
                className={cn(
                  'h-2.5 w-2.5 rounded-full border transition-colors',
                  activeTag === null ? 'border-text bg-text' : 'border-text-muted',
                )}
              />
              All
            </button>
            {tags.map((tag) => (
              <button
                key={tag._id}
                type="button"
                onClick={() => handleSelect(tag.slug.current)}
                className="flex items-center gap-3 py-1.5 font-ui text-xs uppercase tracking-wider text-text-muted transition-colors hover:text-text"
              >
                <span
                  className={cn(
                    'h-2.5 w-2.5 rounded-full border transition-colors',
                    activeTag === tag.slug.current ? 'border-text bg-text' : 'border-text-muted',
                  )}
                />
                {tag.name}
              </button>
            ))}
          </div>
        </div>

        {/* Collapsed bar */}
        <div className="relative z-40 border-t border-border bg-bg/80 backdrop-blur-md">
          <div className="flex items-center gap-6 px-6 py-3">
            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              className="flex shrink-0 items-center gap-1.5 font-ui text-xs uppercase tracking-widest text-text-muted transition-colors hover:text-text"
            >
              Filter
              <span
                className={cn(
                  'text-[0.625rem] transition-transform duration-200',
                  isOpen && 'rotate-180',
                )}
              >
                &#9662;
              </span>
            </button>
            <span className="flex items-center gap-2 font-ui text-xs uppercase tracking-wider text-text-muted">
              <span className="h-2.5 w-2.5 rounded-full border border-text bg-text" />
              {activeLabel}
            </span>
          </div>
        </div>
      </div>

      {/* ── Desktop: inline horizontal row ── */}
      <div className="hidden border-t border-border bg-bg/80 backdrop-blur-md lg:block">
        <div className="scrollbar-hide flex items-center gap-6 overflow-x-auto px-10 py-3">
          <span className="shrink-0 font-ui text-xs uppercase tracking-widest text-text-muted">
            Filter
          </span>

          <button
            type="button"
            onClick={() => onTagChange(null)}
            className="flex shrink-0 items-center gap-2 font-ui text-xs uppercase tracking-wider text-text-muted transition-colors hover:text-text"
          >
            <span
              className={cn(
                'h-2.5 w-2.5 rounded-full border transition-colors',
                activeTag === null ? 'border-text bg-text' : 'border-text-muted',
              )}
            />
            All
          </button>

          {tags.map((tag) => (
            <button
              key={tag._id}
              type="button"
              onClick={() => onTagChange(tag.slug.current)}
              className="flex shrink-0 items-center gap-2 font-ui text-xs uppercase tracking-wider text-text-muted transition-colors hover:text-text"
            >
              <span
                className={cn(
                  'h-2.5 w-2.5 rounded-full border transition-colors',
                  activeTag === tag.slug.current ? 'border-text bg-text' : 'border-text-muted',
                )}
              />
              {tag.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
