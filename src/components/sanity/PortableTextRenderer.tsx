import { PortableText, type PortableTextComponents } from '@portabletext/react'
import type { PortableTextBlock } from '@portabletext/react'
import Image from 'next/image'
import { codeToHtml } from 'shiki'
import { urlFor } from '@/lib/sanity/image'
import type { SanityImage } from '@/lib/sanity/types'

interface CodeBlockValue {
  _key?: string
  _type: string
  language?: string
  code?: string
}

export interface Heading {
  id: string
  text: string
  level: 2 | 3
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function toPlainText(block: PortableTextBlock): string {
  const b = block as unknown as Record<string, unknown>
  if (!Array.isArray(b.children)) return ''
  return (b.children as Array<{ text?: string }>)
    .map((child) => child.text ?? '')
    .join('')
}

/** Extract h2/h3 headings from portable text blocks for table of contents. */
export function extractHeadings(blocks: PortableTextBlock[]): Heading[] {
  const headings: Heading[] = []
  for (const block of blocks) {
    const b = block as unknown as Record<string, unknown>
    if (b.style === 'h2' || b.style === 'h3') {
      const text = toPlainText(block)
      if (text) {
        headings.push({
          id: slugify(text),
          text,
          level: b.style === 'h2' ? 2 : 3,
        })
      }
    }
  }
  return headings
}

async function highlightAllCodeBlocks(blocks: PortableTextBlock[]) {
  const highlighted = new Map<string, string>()

  for (const block of blocks) {
    const b = block as unknown as CodeBlockValue
    if (b._type === 'codeBlock' && b.code && b._key) {
      try {
        const html = await codeToHtml(b.code, {
          lang: b.language || 'text',
          theme: 'catppuccin-mocha',
        })
        highlighted.set(b._key, html)
      } catch {
        try {
          const html = await codeToHtml(b.code, {
            lang: 'text',
            theme: 'catppuccin-mocha',
          })
          highlighted.set(b._key, html)
        } catch {
          // Fall back to plain rendering
        }
      }
    }
  }

  return highlighted
}

interface PortableTextRendererProps {
  value: PortableTextBlock[]
}

export default async function PortableTextRenderer({ value }: PortableTextRendererProps) {
  const highlighted = await highlightAllCodeBlocks(value)

  const components: PortableTextComponents = {
    block: {
      h2: ({ children, value }) => {
        const id = slugify(toPlainText(value as unknown as PortableTextBlock))
        return (
          <h2
            id={id}
            className="mt-12 mb-4 font-heading font-bold text-text leading-tight text-[length:var(--text-heading)] scroll-mt-24"
          >
            {children}
          </h2>
        )
      },
      h3: ({ children, value }) => {
        const id = slugify(toPlainText(value as unknown as PortableTextBlock))
        return (
          <h3
            id={id}
            className="mt-8 mb-3 font-heading font-semibold text-text leading-snug text-lg scroll-mt-24"
          >
            {children}
          </h3>
        )
      },
      blockquote: ({ children }) => (
        <blockquote className="my-6 border-l-4 border-accent pl-4 italic text-text-muted leading-relaxed">
          {children}
        </blockquote>
      ),
      normal: ({ children }) => (
        <p
          className="mb-5 text-text leading-relaxed text-[length:var(--text-body)]"
        >
          {children}
        </p>
      ),
    },

    marks: {
      strong: ({ children }) => (
        <strong className="font-semibold">{children}</strong>
      ),
      em: ({ children }) => <em>{children}</em>,
      code: ({ children }) => (
        <code className="rounded bg-bg px-1.5 py-0.5 font-mono text-sm text-accent">
          {children}
        </code>
      ),
      link: ({ children, value }) => {
        const href = value?.href ?? '#'
        const isExternal = href.startsWith('http')
        return (
          <a
            href={href}
            className="text-accent underline underline-offset-4 decoration-accent/40 hover:decoration-accent transition-colors"
            {...(isExternal && { target: '_blank', rel: 'noopener noreferrer' })}
          >
            {children}
          </a>
        )
      },
    },

    types: {
      image: ({ value }: { value: SanityImage & { alt?: string } }) => {
        const url = urlFor(value).width(1200).quality(80).url()
        return (
          <figure className="my-8">
            <Image
              src={url}
              alt={value.alt ?? ''}
              width={1200}
              height={675}
              className="w-full rounded-lg"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </figure>
        )
      },
      codeBlock: ({ value: blockValue }: { value: CodeBlockValue }) => {
        const html = blockValue._key ? highlighted.get(blockValue._key) : null

        if (html) {
          return (
            <div className="my-6 rounded-lg overflow-hidden">
              {blockValue.language && (
                <div className="px-4 py-2 text-xs font-mono text-text-muted bg-[#1e1e2e] border-b border-white/10">
                  {blockValue.language}
                </div>
              )}
              <div dangerouslySetInnerHTML={{ __html: html }} />
            </div>
          )
        }

        return (
          <div className="my-6 rounded-lg bg-[#1e1e2e] overflow-hidden">
            {blockValue.language && (
              <div className="px-4 py-2 text-xs font-mono text-text-muted border-b border-white/10">
                {blockValue.language}
              </div>
            )}
            <pre className="overflow-x-auto p-4">
              <code className="font-mono text-sm text-[#cdd6f4] leading-relaxed">
                {blockValue.code}
              </code>
            </pre>
          </div>
        )
      },
    },
  }

  return (
    <div className="portable-text">
      <PortableText value={value} components={components} />
    </div>
  )
}
