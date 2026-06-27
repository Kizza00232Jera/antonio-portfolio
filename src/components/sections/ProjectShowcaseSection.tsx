'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useProjectTransition } from '@/contexts/ProjectTransitionContext'
import type { Project } from '@/lib/sanity/types'
import { getThumbnailUrl, padIndex } from '@/utils/project'

gsap.registerPlugin(ScrollTrigger)

const SCRAMBLE_CHARS = 'abcdefghijklmnopqrstuvwxyz%^&*-_+=;:<>,'

/* ── Component ────────────────────────────────────────────── */

interface ProjectShowcaseSectionProps {
  projects: Project[]
}

export default function ProjectShowcaseSection({
  projects,
}: ProjectShowcaseSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const fgContainerRef = useRef<HTMLDivElement>(null)
  const fgImagesRef = useRef<(HTMLDivElement | null)[]>([])
  const bgImagesRef = useRef<(HTMLDivElement | null)[]>([])
  const numberRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const listItemsRef = useRef<(HTMLLIElement | null)[]>([])
  const activeIndexRef = useRef(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const { startTransition } = useProjectTransition()

  /* ── Character scramble animation ── */
  const scrambleText = useCallback((
    container: HTMLElement | null,
    newText: string,
  ) => {
    if (!container) return

    // Kill any ongoing tweens on existing char spans
    const existingChars = container.querySelectorAll('.scramble-char')
    existingChars.forEach(c => gsap.killTweensOf(c))

    // Clear container and create new char spans
    container.textContent = ''
    const chars = newText.split('')
    const animatable: HTMLSpanElement[] = []

    chars.forEach((char) => {
      const span = document.createElement('span')
      span.className = 'scramble-char'
      if (char === ' ') {
        span.innerHTML = '&nbsp;'
        span.style.minWidth = '0.3em'
      } else {
        span.textContent = char
      }
      container.appendChild(span)
      if (char !== ' ') animatable.push(span)
    })

    // Animate each non-space character
    animatable.forEach((span, position) => {
      const finalChar = span.textContent!
      let repeatCount = 0

      gsap.fromTo(span,
        { opacity: 0 },
        {
          duration: 0.03,
          opacity: 1,
          innerHTML: () => SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)],
          repeat: 3,
          repeatDelay: 0.04,
          delay: (position + 1) * 0.06,
          repeatRefresh: true,
          onStart: () => {
            gsap.set(span, { '--opa': 1 })
          },
          onRepeat: () => {
            repeatCount++
            if (repeatCount === 1) {
              gsap.set(span, { '--opa': 0 })
            }
          },
          onComplete: () => {
            gsap.set(span, { innerHTML: finalChar, '--opa': 0, delay: 0.03 })
          },
        }
      )
    })
  }, [])

  /* ── Update all text/state when crossing threshold ── */
  const switchToProject = useCallback((newIndex: number) => {
    if (newIndex === activeIndexRef.current) return
    if (newIndex < 0 || newIndex >= projects.length) return

    activeIndexRef.current = newIndex
    setActiveIndex(newIndex)

    // Update big number (no animation)
    if (numberRef.current) numberRef.current.textContent = padIndex(newIndex)

    // Update title (no animation)
    if (titleRef.current) titleRef.current.textContent = projects[newIndex].title

    // Crossfade background
    bgImagesRef.current.forEach((bg, i) => {
      if (!bg) return
      if (i === newIndex) {
        bg.classList.add('active')
      } else {
        bg.classList.remove('active')
      }
    })

    // Update list highlights + scramble the newly active item
    listItemsRef.current.forEach((item, i) => {
      if (!item) return
      if (i === newIndex) {
        item.classList.add('active')
        scrambleText(item, `[ N.${padIndex(i)} ]  ${projects[i].title}`)
      } else {
        item.classList.remove('active')
      }
    })
  }, [projects, scrambleText])

  /* ── GSAP ScrollTrigger setup ── */
  useEffect(() => {
    if (projects.length === 0) return

    const isMobile = window.innerWidth < 1024
    if (isMobile) return

    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      const totalProjects = projects.length
      const fgImages = fgImagesRef.current.filter(Boolean) as HTMLDivElement[]
      const fgContainer = fgContainerRef.current
      const containerH = fgContainer ? fgContainer.offsetHeight : window.innerHeight

      // Position all foreground images: first at center, rest below (container-relative)
      fgImages.forEach((img, i) => {
        if (i === 0) {
          gsap.set(img, { y: 0 })
        } else {
          gsap.set(img, { y: containerH })
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
              gsap.set(currentImg, { y: -progress * containerH })
            }
            if (nextImg) {
              gsap.set(nextImg, { y: containerH - progress * containerH })
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
      // +1 viewport: after the last project the sticky panel stays frozen
      // while the next section slides up over it (curtain effect)
      style={{ '--showcase-h': `${(projects.length + 1) * 100}vh` } as React.CSSProperties}
    >
      <div ref={stickyRef} className="project-showcase-sticky">
        {/* ── Left Panel ── */}
        <div className="project-left-panel">
          {/* Background images (blurred, darkened) — tiny source since it's
              blurred 8px and darkened, so full resolution is wasted bytes. */}
          {projects.map((project, i) => {
            const url = getThumbnailUrl(project, 400)
            return (
              <div
                key={`bg-${project._id}`}
                ref={(el) => { bgImagesRef.current[i] = el }}
                className={`project-bg-image${i === 0 ? ' active' : ''}`}
              >
                {url && (
                  <Image
                    src={url}
                    alt={`${project.title} preview`}
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
          <div ref={fgContainerRef} className="project-fg-container">
            {projects.map((project, i) => {
              const url = getThumbnailUrl(project)
              return (
                <div
                  key={`fg-${project._id}`}
                  ref={(el) => { fgImagesRef.current[i] = el }}
                  className="project-fg-image cursor-pointer"
                  onClick={handleViewMore}
                  aria-label={`View ${project.title}`}
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
          <ul className="project-list list-none m-0 p-0">
            {projects.map((project, i) => (
              <li
                key={`list-${project._id}`}
                ref={(el) => { listItemsRef.current[i] = el }}
                className={`project-list-item${i === 0 ? ' active' : ''}`}
              >
                [ N.{padIndex(i)} ]&nbsp;&nbsp;{project.title}
              </li>
            ))}
          </ul>

          {/* Big number (top-right, absolute) */}
          <div className="project-number-wrapper">
            <div className="project-number" ref={numberRef}>
              {padIndex(0)}
            </div>
          </div>

          {/* Bottom: view more + title */}
          <div className="project-bottom-right">
            <button
              className="project-view-more"
              onClick={handleViewMore}
            >
              <span className="project-view-more-text">View More</span>
              <span className="project-view-more-arrow">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 33 32" width="33" height="32">
                  <path d="m28 12 3.9 3.9v.1L28 20" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M1.1 16h30.8" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </span>
              <span className="project-view-more-border" />
            </button>

            <div className="project-title" ref={titleRef}>
              {projects[0].title}
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
                            alt={`${project.title} preview`}
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
