import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import PortableTextRenderer from '@/components/sanity/PortableTextRenderer'
import { getProjectBySlug } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/image'

interface ProjectPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
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

  return (
    <article className="mx-auto max-w-[var(--max-width)] px-6 py-[var(--section-gap)]">
      {/* Back link */}
      <Link
        href="/projects"
        className="inline-flex items-center gap-1 text-sm font-medium text-text-muted hover:text-text transition-colors mb-10"
      >
        ← Back to projects
      </Link>

      {/* Header */}
      <header className="mb-12">
        <h1
          className="font-heading font-bold text-text leading-tight mb-4"
          style={{ fontSize: 'var(--text-display)' }}
        >
          {project.title}
        </h1>

        {project.tagline && (
          <p
            className="text-text-muted leading-relaxed mb-6"
            style={{ fontSize: 'var(--text-body)' }}
          >
            {project.tagline}
          </p>
        )}

        {/* Tech stack badges */}
        {project.techStack && project.techStack.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-border px-3 py-0.5 font-mono text-xs text-text-muted"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Cover image */}
      {project.coverImage && (
        <div className="mb-12 overflow-hidden rounded-2xl border border-border">
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

      {/* Focus areas */}
      {project.focusAreas && project.focusAreas.length > 0 && (
        <div className="mb-12">
          <p className="text-xs font-mono text-text-muted uppercase tracking-widest mb-4">
            Focus areas
          </p>
          <ul className="flex flex-wrap gap-3 list-none m-0 p-0">
            {project.focusAreas.map((area) => (
              <li
                key={area}
                className="rounded-lg bg-bg-alt border border-border px-4 py-2 text-sm font-medium text-text"
              >
                {area}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Description (Portable Text) */}
      {project.description && (
        <div className="mx-auto max-w-3xl mb-12">
          <PortableTextRenderer value={project.description} />
        </div>
      )}

      {/* Links */}
      {(project.githubUrl || project.liveUrl) && (
        <div className="mx-auto max-w-3xl flex flex-wrap gap-4 mb-12">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              View live ↗
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-text transition-colors hover:border-accent hover:text-accent"
            >
              View on GitHub ↗
            </a>
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="mx-auto max-w-3xl pt-8 border-t border-border">
        {project.publishedAt && (
          <p className="text-xs font-mono text-text-muted mb-4">
            {new Date(project.publishedAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        )}
        <Link
          href="/projects"
          className="inline-flex items-center gap-1 text-sm font-medium text-text-muted hover:text-text transition-colors"
        >
          ← All projects
        </Link>
      </footer>
    </article>
  )
}
