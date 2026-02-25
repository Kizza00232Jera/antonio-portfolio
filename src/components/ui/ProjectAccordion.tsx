'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { gsap } from 'gsap'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity/image'
import PortableTextRenderer from '@/components/sanity/PortableTextRenderer'
import type { ProjectSection } from '@/lib/sanity/types'
import { cn } from '@/utils/cn'

interface ProjectAccordionProps {
  sections: ProjectSection[]
  className?: string
}

export function ProjectAccordion({ sections, className }: ProjectAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const contentRefs = useRef<(HTMLDivElement | null)[]>([])
  const prefersReduced = useRef(false)

  useEffect(() => {
    prefersReduced.current = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
  }, [])

  const toggle = useCallback(
    (index: number) => {
      const nextOpen = openIndex === index ? null : index

      // Close the currently open section
      if (openIndex !== null && contentRefs.current[openIndex]) {
        const el = contentRefs.current[openIndex]!
        if (prefersReduced.current) {
          el.style.height = '0px'
          el.style.opacity = '0'
        } else {
          gsap.to(el, { height: 0, opacity: 0, duration: 0.4, ease: 'power2.inOut' })
        }
      }

      // Open the new section
      if (nextOpen !== null && contentRefs.current[nextOpen]) {
        const el = contentRefs.current[nextOpen]!
        if (prefersReduced.current) {
          el.style.height = 'auto'
          el.style.opacity = '1'
        } else {
          gsap.to(el, { height: 'auto', opacity: 1, duration: 0.4, ease: 'power2.inOut' })
        }
      }

      setOpenIndex(nextOpen)
    },
    [openIndex],
  )

  if (sections.length === 0) return null

  return (
    <div className={cn('divide-y divide-border', className)}>
      {sections.map((section, i) => {
        const isOpen = openIndex === i

        return (
          <div key={section._key} className="border-border">
            <button
              type="button"
              onClick={() => toggle(i)}
              className="flex w-full items-center justify-between py-5 text-left transition-colors hover:text-accent"
            >
              <span className="font-heading text-lg font-semibold text-text md:text-xl">
                {section.title}
              </span>
              <span className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-lg text-text-muted transition-transform">
                {isOpen ? '\u00d7' : '+'}
              </span>
            </button>

            <div
              ref={(el) => {
                contentRefs.current[i] = el
              }}
              className="overflow-hidden"
              style={{ height: 0, opacity: 0 }}
            >
              <div className="pb-6">
                {section.content && (
                  <PortableTextRenderer value={section.content} />
                )}

                {section.images && section.images.length > 0 && (
                  <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                    {section.images.map((img, imgIdx) => (
                      <Image
                        key={imgIdx}
                        src={urlFor(img).width(800).quality(80).url()}
                        alt=""
                        width={800}
                        height={500}
                        className="w-full rounded-lg"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    ))}
                  </div>
                )}

                {section.links && section.links.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-4">
                    {section.links.map((link) =>
                      link.url ? (
                        <a
                          key={link._key}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-accent underline underline-offset-4 transition-colors hover:text-text"
                        >
                          {link.label ?? link.url}
                        </a>
                      ) : null,
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
