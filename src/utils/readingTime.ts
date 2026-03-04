import type { PortableTextBlock } from '@portabletext/react'

/**
 * Extracts plain text from Portable Text blocks and estimates reading time.
 * Uses ~200 words per minute as average reading speed.
 */
export function estimateReadingTime(blocks: PortableTextBlock[]): number {
  let wordCount = 0

  for (const block of blocks) {
    const b = block as unknown as Record<string, unknown>

    // Standard text blocks have a children array with spans
    if (Array.isArray(b.children)) {
      for (const child of b.children) {
        if (typeof child === 'object' && child !== null && 'text' in child) {
          const text = (child as { text: string }).text
          wordCount += text.split(/\s+/).filter(Boolean).length
        }
      }
    }

    // Code blocks count towards reading time too
    if (b._type === 'codeBlock' && typeof b.code === 'string') {
      wordCount += b.code.split(/\s+/).filter(Boolean).length
    }
  }

  return Math.max(1, Math.ceil(wordCount / 200))
}
