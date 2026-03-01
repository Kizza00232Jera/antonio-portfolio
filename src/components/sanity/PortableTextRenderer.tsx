import { PortableText, type PortableTextComponents } from '@portabletext/react'
import type { PortableTextBlock } from '@portabletext/react'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity/image'
import type { SanityImage } from '@/lib/sanity/types'
import { CodeBlock } from './CodeBlock'
import { MuxVideoPlayer } from '@/components/ui/MuxVideoPlayer'

/* ── Callout config ───────────────────────────────────────── */

const CALLOUT_STYLES: Record<string, { border: string; bg: string; icon: string }> = {
  tip: {
    border: 'border-green-500',
    bg: 'bg-green-500/10',
    icon: '💡',
  },
  info: {
    border: 'border-blue-500',
    bg: 'bg-blue-500/10',
    icon: 'ℹ️',
  },
  warning: {
    border: 'border-amber-500',
    bg: 'bg-amber-500/10',
    icon: '⚠️',
  },
  danger: {
    border: 'border-red-500',
    bg: 'bg-red-500/10',
    icon: '🚫',
  },
}

/* ── Portable Text component map ──────────────────────────── */

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 className="mt-12 mb-4 font-heading font-bold text-text leading-tight text-[length:var(--text-heading)]">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-8 mb-3 font-heading font-semibold text-text leading-snug text-lg">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-6 border-l-4 border-accent pl-4 italic text-text-muted leading-relaxed">
        {children}
      </blockquote>
    ),
    normal: ({ children }) => (
      <p className="mb-5 text-text leading-relaxed text-[length:var(--text-body)]">
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
          {isExternal && (
            <span className="inline-block ml-0.5 text-[0.75em]" aria-hidden="true">
              ↗
            </span>
          )}
        </a>
      )
    },
  },

  types: {
    /* ── Existing: plain image (backwards compatible) ── */
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

    /* ── Code block: Shiki syntax highlighting ── */
    codeBlock: ({ value }: { value: { language?: string; code?: string } }) => (
      <CodeBlock language={value.language} code={value.code} />
    ),

    /* ── Mux video embed ── */
    muxVideo: ({ value }: { value: { playbackId?: string; caption?: string } }) => {
      if (!value.playbackId) return null
      return (
        <figure className="my-8">
          <MuxVideoPlayer playbackId={value.playbackId} />
          {value.caption && (
            <figcaption className="mt-2 text-center text-sm italic text-text-muted">
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },

    /* ── Callout box ── */
    callout: ({ value }: { value: { type?: string; content?: string } }) => {
      const style = CALLOUT_STYLES[value.type ?? 'info'] ?? CALLOUT_STYLES.info
      return (
        <div
          className={`my-6 rounded-lg border-l-4 ${style.border} ${style.bg} px-5 py-4`}
        >
          <div className="flex gap-3">
            <span className="flex-shrink-0 text-lg leading-relaxed" aria-hidden="true">
              {style.icon}
            </span>
            <p className="text-text leading-relaxed text-[length:var(--text-body)] m-0">
              {value.content}
            </p>
          </div>
        </div>
      )
    },

    /* ── Image with caption ── */
    imageWithCaption: ({
      value,
    }: {
      value: { image?: SanityImage; alt?: string; caption?: string }
    }) => {
      if (!value.image) return null
      const url = urlFor(value.image).width(1200).quality(80).url()
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
          {value.caption && (
            <figcaption className="mt-2 text-center text-sm italic text-text-muted">
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },
  },
}

/* ── Renderer ─────────────────────────────────────────────── */

interface PortableTextRendererProps {
  value: PortableTextBlock[]
}

export default function PortableTextRenderer({ value }: PortableTextRendererProps) {
  return (
    <div className="portable-text">
      <PortableText value={value} components={components} />
    </div>
  )
}
