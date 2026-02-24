import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import { getAllProjects, getProjectBySlug } from '@/lib/sanity/queries'
import { sanityImage } from '@/lib/sanity/image'

interface ProjectPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const projects = await getAllProjects()
  return projects.map((p) => ({ slug: p.slug.current }))
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project) return { title: 'Project not found' }

  return {
    title: `${project.title} — Antonio`,
    description: project.tagline ?? 'A project by Antonio.',
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project) notFound()

  return (
    <main className="mx-auto max-w-[var(--max-width)] px-6 py-[var(--section-gap)]">
      {/* Back link */}
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors mb-10"
      >
        ← All projects
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
          <p className="text-lg text-text-muted leading-relaxed max-w-2xl">
            {project.tagline}
          </p>
        )}

        {/* Tech stack badges */}
        {project.techStack && project.techStack.length > 0 && (
          <ul className="flex flex-wrap gap-2 list-none m-0 p-0 mt-6">
            {project.techStack.map((tech) => (
              <li
                key={tech}
                className="rounded-full border border-border px-3 py-0.5 font-mono text-xs text-text-muted"
              >
                {tech}
              </li>
            ))}
          </ul>
        )}
      </header>

      {/* Cover image */}
      {project.coverImage && (
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border mb-12">
          <Image
            src={sanityImage(project.coverImage).width(1200).height(675).url()}
            alt={project.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1200px"
            priority
          />
        </div>
      )}

      {/* Focus areas */}
      {project.focusAreas && project.focusAreas.length > 0 && (
        <section className="mb-12">
          <h2
            className="font-heading font-semibold text-text mb-4"
            style={{ fontSize: 'var(--text-heading)' }}
          >
            Focus areas
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none m-0 p-0">
            {project.focusAreas.map((area) => (
              <li
                key={area}
                className="flex items-center gap-2 text-text-muted"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {area}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Description (Portable Text) */}
      {project.description && (
        <section className="prose mb-12">
          <PortableText value={project.description} />
        </section>
      )}

      {/* Links */}
      {(project.githubUrl || project.liveUrl) && (
        <section className="flex flex-wrap gap-3 mb-12">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              View live ↗
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-text transition-colors hover:border-accent hover:text-accent"
            >
              GitHub ↗
            </a>
          )}
        </section>
      )}

      {/* Metadata footer */}
      {project.publishedAt && (
        <footer className="border-t border-border pt-6 text-sm text-text-muted">
          Published{' '}
          {new Date(project.publishedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
          })}
        </footer>
      )}
    </main>
  )
}
