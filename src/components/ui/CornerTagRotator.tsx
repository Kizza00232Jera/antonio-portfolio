'use client'

import { useEffect, useState } from 'react'

interface CornerTagRotatorProps {
  tags: string[]
  className?: string
  intervalMs?: number
}

/**
 * Shows exactly ONE tag at a time in the project-card image corner, cycling
 * through them with a vertical slide/fade. Only the active tag is rendered to
 * the DOM (keyed so it re-mounts and re-animates on change), so tags can never
 * stack into multiple lines or overlap — it always stays a single short line
 * hugging the image edge, at any screen size.
 */
export function CornerTagRotator({
  tags,
  className,
  intervalMs = 2600,
}: CornerTagRotatorProps) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (tags.length <= 1) return
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % tags.length)
    }, intervalMs)
    return () => clearInterval(id)
  }, [tags.length, intervalMs])

  if (tags.length === 0) return null

  // Guard against the index briefly exceeding a shortened tag list.
  const tag = tags[active % tags.length]

  return (
    <span className={`corner-tag-rotator [writing-mode:vertical-rl] ${className ?? ''}`}>
      <span key={`${tag}-${active}`} className="corner-tag-item">
        {tag}
      </span>
    </span>
  )
}
