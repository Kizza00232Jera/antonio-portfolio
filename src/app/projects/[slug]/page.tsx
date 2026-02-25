import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getProjectBySlug } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/image'
import { ProjectDetailClient } from '@/components/project/ProjectDetailClient'

interface ProjectPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params
  const project = await getProjectBySlug(slug)

  if (!project) {
    return { title: 'Project not found' }
  }

  return {
    title: `${project.title} | Antonio`,
    description: project.tagline ?? 'A project by Antonio.',
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params
  const project = await getProjectBySlug(slug)

  if (!project) {
    notFound()
  }

  const posterUrl = project.coverImage
    ? urlFor(project.coverImage).width(1920).quality(80).url()
    : undefined

  return (
    <article className="mx-auto max-w-[var(--max-width)] px-6 py-[var(--section-gap)]">
      {/* Title + intro */}
      <header className="mb-10 text-center">
        <h1
          className="font-heading font-bold leading-tight text-text"
          style={{ fontSize: 'var(--text-display)' }}
        >
          {project.title}
        </h1>

        {project.tagline && (
          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-text-muted">
            {project.tagline}
          </p>
        )}
      </header>

      {/* Cover image (shown when no video) */}
      {!project.muxVideoId && project.coverImage && (
        <div className="mb-8 overflow-hidden rounded-xl">
          <Image
            src={urlFor(project.coverImage).width(1200).quality(85).url()}
            alt={project.title}
            width={1200}
            height={675}
            className="w-full"
            sizes="(max-width: 1200px) 100vw, 1200px"
            priority
          />
        </div>
      )}

      {/* Client-rendered: video, links, marquee, accordion */}
      <ProjectDetailClient
        muxVideoId={project.muxVideoId}
        posterUrl={posterUrl}
        title={project.title}
        techStackRefs={project.techStackRefs}
        sections={project.sections}
        liveUrl={project.liveUrl}
        githubUrl={project.githubUrl}
      />

    </article>
  )
}
