'use client'

import { useState, useCallback } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
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

  const filteredProjects = activeTag
    ? projects.filter((p) =>
        p.tags?.some((t) => t.slug.current === activeTag),
      )
    : projects

  const handleTagChange = useCallback((tagSlug: string | null) => {
    setActiveTag(tagSlug)
    // Recalculate horizontal scroll distance after filter changes card count
    requestAnimationFrame(() => {
      ScrollTrigger.refresh()
    })
  }, [])

  return (
    <section className="relative min-h-screen pb-16">
      {/* Desktop: two-column layout. Mobile: stacked */}
      <div className="flex flex-col lg:flex-row">
        {/* Left column: heading + intro */}
        <div className="px-6 pt-[var(--section-gap)] lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[35vw] lg:flex-col lg:justify-center lg:px-10">
          <h1
            className="font-heading font-bold uppercase leading-none text-text"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)' }}
          >
            Selected
            <br />
            Work
          </h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-text-muted md:text-base">
            Every project is a journey. From the first spark of an idea to a
            polished product &mdash; with passion, precision, and a focus on
            building things that work beautifully.
          </p>
        </div>

        {/* Right column: horizontal scrolling cards */}
        <div className="mt-10 flex-1 lg:mt-0">
          {filteredProjects.length === 0 ? (
            <div className="flex h-[50vh] items-center justify-center px-6">
              <p className="text-sm text-text-muted">
                No projects match this filter.
              </p>
            </div>
          ) : (
            <div className="hidden lg:block">
              <HorizontalScroll
                className="h-screen"
                trackClassName="h-full pl-8 pr-[20vw]"
              >
                {filteredProjects.map((project) => (
                  <HorizontalProjectCard
                    key={project._id}
                    project={project}
                  />
                ))}
              </HorizontalScroll>
            </div>
          )}

          {/* Mobile: vertical card list */}
          <div className="flex flex-col gap-10 px-6 pb-10 lg:hidden">
            {filteredProjects.map((project) => (
              <HorizontalProjectCard
                key={project._id}
                project={project}
                className="!w-full"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Fixed bottom filter bar */}
      {tags.length > 0 && (
        <ProjectFilterBar
          tags={tags}
          activeTag={activeTag}
          onTagChange={handleTagChange}
        />
      )}
    </section>
  )
}
