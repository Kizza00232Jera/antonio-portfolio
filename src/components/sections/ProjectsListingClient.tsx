'use client'

import { useState, useCallback } from 'react'
import { HorizontalProjectCard } from '@/components/ui/HorizontalProjectCard'
import { HorizontalScroll } from '@/components/ui/HorizontalScroll'
import { ProjectFilterBar } from '@/components/ui/ProjectFilterBar'
import type { Project, Tag } from '@/lib/sanity/types'

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

  const filteredProjects = activeTag
    ? projects.filter((p) =>
        p.tags?.some((t) => t.slug.current === activeTag),
      )
    : projects

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
          <div className="hidden h-full lg:block">
            <HorizontalScroll
              className="h-full"
              trackClassName="h-full pl-10"
              onProgress={setScrollProgress}
            >
              {/* Intro panel — scrolls away with cards */}
              <div className="flex h-full w-[32vw] shrink-0 flex-col justify-center pr-8">
                <h1
                  className="font-heading font-bold uppercase leading-none text-text"
                  style={{ fontSize: 'clamp(2.5rem, 4.5vw, 4.5rem)' }}
                >
                  Selected
                  <br />
                  Work
                </h1>
                <p className="mt-6 max-w-md text-sm leading-relaxed text-text-muted">
                  Every project is a journey. From the first spark of an idea to
                  a polished product &mdash; with passion, precision, and a
                  focus on building things that work beautifully.
                </p>
              </div>

              {/* Project cards */}
              {filteredProjects.map((project) => (
                <HorizontalProjectCard
                  key={project._id}
                  project={project}
                />
              ))}
            </HorizontalScroll>
          </div>
        )}

        {/* Mobile: scrollable vertical list */}
        <div className="flex h-full flex-col gap-6 overflow-y-auto px-6 py-20 lg:hidden">
          <h1 className="font-heading text-3xl font-bold uppercase leading-none text-text">
            Selected Work
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-text-muted">
            Every project is a journey. From the first spark of an idea to a
            polished product &mdash; with passion, precision, and a focus on
            building things that work beautifully.
          </p>
          {filteredProjects.map((project) => (
            <HorizontalProjectCard
              key={project._id}
              project={project}
              className="!w-full"
            />
          ))}
        </div>
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
