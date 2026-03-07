'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { urlFor } from '@/lib/sanity/image'
import { useProjectTransition } from '@/contexts/ProjectTransitionContext'
import type { Project } from '@/lib/sanity/types'

gsap.registerPlugin(ScrollTrigger)

/* ── Helpers ─────────────────────────────────────────────── */

function getThumbnailUrl(project: Project): string | null {
  if (project.muxVideoId) {
    return `https://image.mux.com/${project.muxVideoId}/thumbnail.png?width=900&height=1200&fit_mode=smartcrop`
  }
  if (project.coverImage) {
    return urlFor(project.coverImage).width(900).height(1200).quality(80).url()
  }
  return null
}

function padIndex(i: number): string {
  return String(i + 1).padStart(2, '0')
}

const EASE = 'power3.out'
const TRANSITION_DURATION = 0.85

/* ── Component ────────────────────────────────────────────── */

interface ProjectShowcaseSectionProps {
  projects: Project[]
}

export default function ProjectShowcaseSection({
  projects,
}: ProjectShowcaseSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const fgImagesRef = useRef<(HTMLDivElement | null)[]>([])
  const bgImagesRef = useRef<(HTMLDivElement | null)[]>([])
  const numberRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const listItemsRef = useRef<(HTMLSpanElement | null)[]>([])
  const activeIndexRef = useRef(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const { startTransition } = useProjectTransition()

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])

  /* ── Transition text with slide-up mask effect ── */
  const transitionText = useCallback((
    container: HTMLDivElement | null,
    newText: string,
  ) => {
    if (!container) return

    const current = container.querySelector('.text-current') as HTMLElement
    const next = container.querySelector('.text-next') as HTMLElement
    if (!current || !next) return

    next.textContent = newText

    const tl = gsap.timeline()
    tl.to(current, {
      y: '-110%',
      duration: TRANSITION_DURATION,
      ease: EASE,
    }, 0)
    tl.fromTo(next, {
      y: '110%',
    }, {
      y: '0%',
      duration: TRANSITION_DURATION,
      ease: EASE,
    }, 0)
    tl.add(() => {
      current.textContent = newText
      gsap.set(current, { y: '0%' })
      gsap.set(next, { y: '110%' })
    })
  }, [])

  /* ── Update all text/state when crossing threshold ── */
  const switchToProject = useCallback((newIndex: number) => {
    if (newIndex === activeIndexRef.current) return
    if (newIndex < 0 || newIndex >= projects.length) return

    activeIndexRef.current = newIndex
    setActiveIndex(newIndex)

    // Transition big number
    transitionText(numberRef.current, padIndex(newIndex))

    // Transition title
    transitionText(titleRef.current, projects[newIndex].title)

    // Crossfade background
    bgImagesRef.current.forEach((bg, i) => {
      if (!bg) return
      if (i === newIndex) {
        bg.classList.add('active')
      } else {
        bg.classList.remove('active')
      }
    })

    // Update list highlights
    listItemsRef.current.forEach((item, i) => {
      if (!item) return
      if (i === newIndex) {
        item.classList.add('active')
      } else {
        item.classList.remove('active')
      }
    })
  }, [projects, transitionText])

  /* ── GSAP ScrollTrigger setup ── */
  useEffect(() => {
    if (projects.length === 0) return

    const isMobile = window.innerWidth < 768
    if (isMobile) return

    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      const totalProjects = projects.length
      const fgImages = fgImagesRef.current.filter(Boolean) as HTMLDivElement[]

      // Position all foreground images: first at center, rest below
      fgImages.forEach((img, i) => {
        if (i === 0) {
          gsap.set(img, { yPercent: 0 })
        } else {
          gsap.set(img, { yPercent: 150 })
        }
      })

      // Set first bg active
      bgImagesRef.current.forEach((bg, i) => {
        if (bg) {
          if (i === 0) bg.classList.add('active')
          else bg.classList.remove('active')
        }
      })

      // Set first list item active
      listItemsRef.current.forEach((item, i) => {
        if (item) {
          if (i === 0) item.classList.add('active')
          else item.classList.remove('active')
        }
      })

      // Create one ScrollTrigger per transition (N-1 transitions)
      for (let i = 0; i < totalProjects - 1; i++) {
        const startPercent = i / totalProjects
        const endPercent = (i + 1) / totalProjects

        ScrollTrigger.create({
          trigger: section,
          start: () => `top+=${startPercent * (section.scrollHeight - window.innerHeight)} top`,
          end: () => `top+=${endPercent * (section.scrollHeight - window.innerHeight)} top`,
          scrub: 0.5,
          onUpdate: (self) => {
            const progress = self.progress

            // Current image moves up, next image moves into view
            const currentImg = fgImages[i]
            const nextImg = fgImages[i + 1]

            if (currentImg) {
              gsap.set(currentImg, { yPercent: -progress * 150 })
            }
            if (nextImg) {
              gsap.set(nextImg, { yPercent: 150 - progress * 150 })
            }

            // At 50% crossover, switch text
            if (progress > 0.5 && activeIndexRef.current === i) {
              switchToProject(i + 1)
            } else if (progress <= 0.5 && activeIndexRef.current === i + 1) {
              switchToProject(i)
            }
          },
        })
      }
    }, section)

    return () => ctx.revert()
  }, [projects, switchToProject])

  /* ── View More click handler ── */
  const handleViewMore = useCallback(() => {
    const project = projects[activeIndexRef.current]
    if (!project) return

    const fgImage = fgImagesRef.current[activeIndexRef.current]
    if (!fgImage) return

    const thumbnailUrl = getThumbnailUrl(project)
    if (!thumbnailUrl) return

    const rect = fgImage.getBoundingClientRect()

    startTransition({
      slug: project.slug.current,
      thumbnailUrl,
      imageRect: {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      },
      projectTitle: project.title,
      publishedAt: project.publishedAt,
      githubUrl: project.githubUrl,
      liveUrl: project.liveUrl,
      muxVideoId: project.muxVideoId,
    })
  }, [projects, startTransition])

  if (projects.length === 0) return null

  return (
    <section
      ref={sectionRef}
      data-theme="dark"
      className="project-showcase"
      style={isMobile ? undefined : { height: `${projects.length * 100}vh` }}
    >
      <div ref={stickyRef} className="project-showcase-sticky">
        {/* ── Left Panel ── */}
        <div className="project-left-panel">
          {/* Background images (blurred, darkened) */}
          {projects.map((project, i) => {
            const url = getThumbnailUrl(project)
            return (
              <div
                key={`bg-${project._id}`}
                ref={(el) => { bgImagesRef.current[i] = el }}
                className={`project-bg-image${i === 0 ? ' active' : ''}`}
              >
                {url && (
                  <Image
                    src={url}
                    alt=""
                    fill
                    sizes="61vw"
                    className="object-cover"
                    style={{ filter: 'blur(8px) brightness(0.35)', transform: 'scale(1.1)' }}
                  />
                )}
              </div>
            )
          })}

          {/* Foreground images (scroll-driven) */}
          <div className="project-fg-container">
            {projects.map((project, i) => {
              const url = getThumbnailUrl(project)
              return (
                <div
                  key={`fg-${project._id}`}
                  ref={(el) => { fgImagesRef.current[i] = el }}
                  className="project-fg-image"
                >
                  {url && (
                    <Image
                      src={url}
                      alt={project.title}
                      fill
                      sizes="(max-width: 768px) 70vw, 30vw"
                      className="object-cover"
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="project-right-panel">
          {/* Top: project list */}
          <div className="project-list">
            {projects.map((project, i) => (
              <span
                key={`list-${project._id}`}
                ref={(el) => { listItemsRef.current[i] = el }}
                className={`project-list-item${i === 0 ? ' active' : ''}`}
              >
                [ N.{padIndex(i)} ]&nbsp;&nbsp;{project.title}
              </span>
            ))}
          </div>

          {/* Big number (top-right, absolute) */}
          <div className="project-number-wrapper" ref={numberRef}>
            <div className="project-number text-current">
              {padIndex(0)}
            </div>
            <div
              className="project-number text-next"
              style={{ position: 'absolute', top: 0, left: 0, width: '100%' }}
            >
              {padIndex(0)}
            </div>
          </div>

          {/* Bottom: view more + title */}
          <div className="project-bottom-right">
            <button
              className="project-view-more"
              onClick={handleViewMore}
            >
              View More
            </button>

            <div className="project-title-wrapper" ref={titleRef}>
              <div className="project-title-mask">
                <div className="project-title text-current">
                  {projects[0].title}
                </div>
                <div
                  className="project-title text-next"
                  style={{ position: 'absolute', bottom: 0, left: 0, width: '100%' }}
                >
                  {projects[0].title}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile project cards (hidden on desktop, shown on mobile) */}
          <div className="project-mobile-list">
            {projects.map((project, i) => {
              const url = getThumbnailUrl(project)
              return (
                <Link
                  key={`mobile-${project._id}`}
                  href={`/projects/${project.slug.current}`}
                  className="project-mobile-card"
                >
                  {/* Image area with BG + foreground */}
                  <div className="project-mobile-card-image-area">
                    {url && (
                      <>
                        <div className="project-mobile-card-bg">
                          <Image
                            src={url}
                            alt=""
                            fill
                            sizes="100vw"
                          />
                        </div>
                        <div className="project-mobile-card-fg">
                          <Image
                            src={url}
                            alt={project.title}
                            fill
                            sizes="70vw"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Info area */}
                  <div className="project-mobile-card-info">
                    <div className="project-mobile-card-header">
                      <span className="project-mobile-card-title">
                        {project.title}
                      </span>
                      <span className="project-mobile-card-number">
                        N.{padIndex(i)}
                      </span>
                    </div>
                    <div className="project-mobile-card-footer">
                      <span className="project-mobile-card-view">
                        View More
                      </span>
                      <svg
                        className="project-mobile-card-arrow"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
