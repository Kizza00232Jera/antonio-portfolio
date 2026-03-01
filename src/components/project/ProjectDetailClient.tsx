'use client'

import dynamic from 'next/dynamic'
import type { TechStackItem, ProjectSection } from '@/lib/sanity/types'

const MuxVideoPlayer = dynamic(
  () =>
    import('@/components/ui/MuxVideoPlayer').then((m) => m.MuxVideoPlayer),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-video w-full animate-pulse rounded-xl bg-bg-alt" />
    ),
  },
)

const TechMarquee = dynamic(
  () => import('@/components/ui/TechMarquee').then((m) => m.TechMarquee),
  { ssr: false },
)

const ProjectAccordion = dynamic(
  () =>
    import('@/components/ui/ProjectAccordion').then((m) => m.ProjectAccordion),
  { ssr: false },
)

interface ProjectDetailClientProps {
  muxVideoId?: string
  posterUrl?: string
  title: string
  techStackRefs?: TechStackItem[]
  sections?: ProjectSection[]
  liveUrl?: string
  githubUrl?: string
}

export function ProjectDetailClient({
  muxVideoId,
  posterUrl,
  title,
  techStackRefs,
  sections,
  liveUrl,
  githubUrl,
}: ProjectDetailClientProps) {
  return (
    <>
      {/* Video player */}
      {muxVideoId && (
        <div className="mb-6">
          <MuxVideoPlayer
            playbackId={muxVideoId}
            poster={posterUrl}
          />
        </div>
      )}

      {/* Links row — between video and marquee */}
      {(liveUrl || githubUrl) && (
        <div className="mb-8 flex items-center justify-between">
          {liveUrl ? (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-ui text-sm text-text-muted underline underline-offset-4 transition-colors hover:text-accent"
            >
              View live
            </a>
          ) : (
            <span />
          )}
          {githubUrl ? (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-ui text-sm text-text-muted underline underline-offset-4 transition-colors hover:text-accent"
            >
              GitHub
            </a>
          ) : (
            <span />
          )}
        </div>
      )}

      {/* Tech stack marquee */}
      {techStackRefs && techStackRefs.length > 0 && (
        <TechMarquee items={techStackRefs} className="mb-12" />
      )}

      {/* Accordion sections */}
      {sections && sections.length > 0 && (
        <ProjectAccordion sections={sections} className="mb-12" />
      )}
    </>
  )
}
