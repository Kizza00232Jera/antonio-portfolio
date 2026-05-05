'use client'

import { useState, useCallback } from 'react'
import { HorizontalProjectCard } from '@/components/ui/HorizontalProjectCard'
import { HorizontalScroll } from '@/components/ui/HorizontalScroll'
import { ProjectFilterBar } from '@/components/ui/ProjectFilterBar'
import type { Project, Tag } from '@/lib/sanity/types'
import { filterByTag } from '@/utils/tags'

interface ProjectsListingClientProps {
  projects: Project[]
  tags: Tag[]
}

export function ProjectsListingClient({
  projects,
  tags,
}: ProjectsListingClientProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  const filteredProjects = filterByTag(
    projects,
    activeTag,
    (p) => (p.tags ?? []).map((t) => t.slug.current),
  )

  const handleTagChange = useCallback((tagSlug: string | null) => {
    setActiveTag(tagSlug)
  }, [])

  return (
    <section className="flex h-full flex-col">
      {/* Main content — heading + cards in one horizontal track */}
      <div className="flex-1 overflow-hidden">
        {filteredProjects.length === 0 ? (
          <div className="flex h-full items-center justify-center px-6">
            <p className="text-sm text-text-muted">
              No projects match this filter.
            </p>
          </div>
        ) : (
          <HorizontalScroll
            className="h-full flex flex-col justify-center"
            trackClassName="flex-nowrap justify-start whitespace-nowrap"
            trackStyle={{
              height: 'var(--card-h)',
            }}
            onProgress={setScrollProgress}
          >
            {/* Intro panel — aligned with card content */}
            <div className="flex h-full w-[70vw] shrink-0 flex-col justify-center whitespace-normal pl-5 pr-6 md:pl-10 md:pr-0 lg:w-[40vw]">
              <div className="flex flex-col justify-between" style={{ height: 'calc(50% + 6rem)' }}>
                <h1
                  className="font-heading font-bold uppercase leading-none text-text"
                  style={{ fontSize: 'clamp(2rem, 4.5vw, 4.5rem)' }}
                >
                  Selected
                  <br />
                  Work
                </h1>
                <p className="max-w-xs text-sm leading-relaxed text-text-muted">
                  Every project is a journey. From the first spark of an idea to
                  a polished product &mdash; with passion, precision, and a
                  focus on building things that work beautifully.
                </p>
              </div>
            </div>

            {/* Project cards — border-l creates separator lines */}
            {filteredProjects.map((project) => (
              <HorizontalProjectCard
                key={project._id}
                project={project}
              />
            ))}
          </HorizontalScroll>
        )}
      </div>

      {/* Progress bar + filter bar */}
      <div className="shrink-0">
        {/* Scroll progress indicator */}
        <div className="h-px bg-border">
          <div
            className="h-full bg-text transition-[width] duration-300 ease-out"
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </div>

        {/* Filter bar */}
        {tags.length > 0 && (
          <ProjectFilterBar
            tags={tags}
            activeTag={activeTag}
            onTagChange={handleTagChange}
          />
        )}
      </div>
    </section>
  )
}
