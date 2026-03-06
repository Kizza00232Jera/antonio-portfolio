'use client'

import { useState } from 'react'
import { cn } from '@/utils/cn'

interface BlogFilterBarProps {
  tags: string[]
  activeTag: string | null
  onTagChange: (tag: string | null) => void
  totalCount: number
}

export function BlogFilterBar({
  tags,
  activeTag,
  onTagChange,
  totalCount,
}: BlogFilterBarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const activeLabel = activeTag ?? 'All'

  const handleSelect = (tag: string | null) => {
    onTagChange(tag)
    setIsOpen(false)
  }

  return (
    <div className="relative shrink-0">
      {/* ── Mobile: collapsible ── */}
      <div className="relative md:hidden">
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setIsOpen(false)}
          />
        )}

        <div className="relative border-b border-border">
          <div className="flex items-center justify-between px-6 py-3">
            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              className="flex shrink-0 items-center gap-1.5 font-ui text-xs uppercase tracking-widest text-text-muted transition-colors hover:text-text"
            >
              Filters
              <span
                className={cn(
                  'text-[0.625rem] transition-transform duration-200',
                  isOpen && 'rotate-180',
                )}
              >
                &#9662;
              </span>
            </button>
            <span className="font-mono text-xs text-text-muted">{totalCount}</span>
          </div>
        </div>

        <div
          className={cn(
            'absolute left-0 right-0 overflow-hidden border-b border-border bg-bg transition-all duration-300 ease-out',
            isOpen ? 'max-h-[60vh] opacity-100' : 'max-h-0 opacity-0 pointer-events-none',
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
                key={tag}
                type="button"
                onClick={() => handleSelect(tag)}
                className="flex items-center gap-3 py-1.5 font-ui text-xs uppercase tracking-wider text-text-muted transition-colors hover:text-text"
              >
                <span
                  className={cn(
                    'h-2.5 w-2.5 rounded-full border transition-colors',
                    activeTag === tag ? 'border-text bg-text' : 'border-text-muted',
                  )}
                />
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Desktop: inline horizontal ── */}
      <div className="hidden border-b border-border md:block">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-5">
            <span className="shrink-0 font-ui text-xs uppercase tracking-widest text-text-muted">
              Filters
            </span>

            <button
              type="button"
              onClick={() => onTagChange(null)}
              className={cn(
                'font-ui text-xs uppercase tracking-wider transition-colors hover:text-text',
                activeTag === null ? 'text-text' : 'text-text-muted',
              )}
            >
              All
            </button>

            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onTagChange(tag)}
                className={cn(
                  'font-ui text-xs uppercase tracking-wider transition-colors hover:text-text',
                  activeTag === tag ? 'text-text' : 'text-text-muted',
                )}
              >
                {tag}
              </button>
            ))}
          </div>

          <span className="font-mono text-xs text-text-muted">{totalCount}</span>
        </div>
      </div>
    </div>
  )
}
