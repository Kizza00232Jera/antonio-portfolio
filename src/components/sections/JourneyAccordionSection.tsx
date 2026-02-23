'use client'

import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { cn } from '@/utils/cn'

interface AccordionItem {
  id: string
  index: string
  title: string
  location: string
  period: string
  description: string
}

const items: AccordionItem[] = [
  {
    id: 'multimedia',
    index: '01',
    title: 'Multimedia Design',
    location: 'Aalborg, Denmark',
    period: '2020 – 2023',
    description:
      'Moved from Croatia to Aalborg to study Medialogy — a bachelor programme at the intersection of design, code, and human experience. Learned to prototype, test, and iterate on digital products. Built everything from interactive installations to web applications.',
  },
  {
    id: 'mono',
    index: '02',
    title: 'Internship — Mono',
    location: 'Aalborg, Denmark',
    period: '2022',
    description:
      'Three-month placement as a UI/UX Designer at Mono. Worked on client-facing design projects — wireframing, prototyping in Figma, and collaborating with developers to bring interfaces to life.',
  },
  {
    id: 'webdev',
    index: '03',
    title: 'Web Development Top-up',
    location: 'Aalborg, Denmark',
    period: '2023 – 2024',
    description:
      'One-year top-up degree deepening the technical side: JavaScript, TypeScript, React, Next.js, databases, and APIs. Bridging the gap between design thinking and engineering craft.',
  },
  {
    id: 'decode',
    index: '04',
    title: 'Internship — Decode',
    location: 'Aalborg, Denmark',
    period: '2024',
    description:
      'Three-month placement as a Web Developer at Decode. Shipped production features, worked in a team codebase, and built the habit of writing code that others can read and maintain.',
  },
]

function AccordionRow({
  item,
  isOpen,
  onToggle,
}: {
  item: AccordionItem
  isOpen: boolean
  onToggle: () => void
}) {
  const contentRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (contentRef.current) {
        contentRef.current.style.height = isOpen ? 'auto' : '0px'
      }
      return
    }

    if (!contentRef.current) return

    if (isOpen) {
      gsap.fromTo(
        contentRef.current,
        { height: 0, opacity: 0 },
        { height: 'auto', opacity: 1, duration: 0.5, ease: 'power3.inOut' }
      )
    } else {
      gsap.to(contentRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.4,
        ease: 'power3.inOut',
      })
    }
  }, [isOpen])

  return (
    <div className="border-t border-border">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-6 py-6 text-left"
        aria-expanded={isOpen}
      >
        <div className="flex items-baseline gap-6">
          <span className="font-mono text-xs text-text-muted tabular-nums">
            {item.index}
          </span>
          <span
            className={cn(
              'font-heading font-semibold transition-colors duration-200',
              isOpen ? 'text-accent' : 'text-text'
            )}
            style={{ fontSize: 'var(--text-heading)' }}
          >
            {item.title}
          </span>
        </div>

        <div className="flex items-center gap-6 shrink-0">
          <span className="hidden font-mono text-xs text-text-muted sm:block">
            {item.period}
          </span>
          <span
            className={cn(
              'font-mono text-lg text-text-muted transition-transform duration-300',
              isOpen && 'rotate-45'
            )}
            aria-hidden
          >
            +
          </span>
        </div>
      </button>

      {/* Collapsible content — height animated by GSAP */}
      <div
        ref={contentRef}
        className="overflow-hidden"
        style={{ height: 0, opacity: 0 }}
      >
        <div className="grid grid-cols-1 gap-6 pb-8 sm:grid-cols-[auto_1fr] sm:gap-10">
          <div className="flex flex-col gap-1">
            <p className="font-mono text-xs text-accent uppercase tracking-widest">
              {item.location}
            </p>
            <p className="font-mono text-xs text-text-muted">
              {item.period}
            </p>
          </div>
          <p
            className="font-body text-text-muted"
            style={{ fontSize: 'var(--text-body)', lineHeight: 1.7 }}
          >
            {item.description}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function JourneyAccordionSection() {
  const [openId, setOpenId] = useState<string | null>(null)

  function toggle(id: string) {
    setOpenId((prev) => (prev === id ? null : id))
  }

  return (
    <section className="mx-auto max-w-[var(--max-width)] px-6 pb-[var(--section-gap)]">
      <p className="mb-3 font-mono text-sm text-text-muted uppercase tracking-widest">
        The journey
      </p>

      <div>
        {items.map((item) => (
          <AccordionRow
            key={item.id}
            item={item}
            isOpen={openId === item.id}
            onToggle={() => toggle(item.id)}
          />
        ))}
        {/* Bottom border */}
        <div className="border-t border-border" />
      </div>
    </section>
  )
}
