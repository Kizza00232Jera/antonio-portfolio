import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { notFound } from 'next/navigation'
import { getProjectBySlug } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/image'

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

      {/* Video or cover image */}
      <div className="mb-8">
        {project.muxVideoId ? (
          <MuxVideoPlayer
            playbackId={project.muxVideoId}
            poster={posterUrl}
            title={project.title}
          />
        ) : project.coverImage ? (
          <div className="overflow-hidden rounded-xl">
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
        ) : null}
      </div>

      {/* Links row */}
      {(project.liveUrl || project.githubUrl) && (
        <div className="mb-12 flex items-center justify-between">
          {project.liveUrl ? (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm text-text-muted underline underline-offset-4 transition-colors hover:text-accent"
            >
              View live
            </a>
          ) : (
            <span />
          )}
          {project.githubUrl ? (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm text-text-muted underline underline-offset-4 transition-colors hover:text-accent"
            >
              GitHub
            </a>
          ) : (
            <span />
          )}
        </div>
      )}

      {/* Tech stack marquee */}
      {project.techStackRefs && project.techStackRefs.length > 0 && (
        <TechMarquee items={project.techStackRefs} className="mb-12" />
      )}

      {/* Accordion sections */}
      {project.sections && project.sections.length > 0 && (
        <ProjectAccordion sections={project.sections} className="mb-12" />
      )}

      {/* Footer */}
      <footer className="border-t border-border pt-8">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1 text-sm font-medium text-text-muted transition-colors hover:text-text"
        >
          &larr; All projects
        </Link>
      </footer>
    </article>
  )
}
