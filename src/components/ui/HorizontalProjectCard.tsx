import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/lib/sanity/image'
import type { Project } from '@/lib/sanity/types'
import { cn } from '@/utils/cn'

interface HorizontalProjectCardProps {
  project: Project
  className?: string
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export function HorizontalProjectCard({
  project,
  className,
}: HorizontalProjectCardProps) {
  // Use Mux thumbnail if video exists, otherwise cover image
  const thumbnailUrl = project.muxVideoId
    ? `https://image.mux.com/${project.muxVideoId}/thumbnail.png?width=960&height=540&fit_mode=smartcrop`
    : project.coverImage
      ? urlFor(project.coverImage).width(960).height(540).quality(80).url()
      : null

  return (
    <Link
      href={`/projects/${project.slug.current}`}
      className={cn(
        'group block w-[85vw] shrink-0 sm:w-[70vw] lg:w-[50vw]',
        className,
      )}
    >
      {/* Hero image / video thumbnail */}
      {thumbnailUrl && (
        <div className="relative aspect-video w-full overflow-hidden rounded-xl">
          <Image
            src={thumbnailUrl}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 85vw, (max-width: 1024px) 70vw, 50vw"
          />
        </div>
      )}

      {/* Meta row: date + tags */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {project.publishedAt && (
          <span className="font-mono text-xs uppercase tracking-wider text-text-muted">
            {formatDate(project.publishedAt)}
          </span>
        )}
        {project.tags?.map((tag) => (
          <span
            key={tag._id}
            className="rounded-full border border-border px-3 py-0.5 font-mono text-xs uppercase tracking-wider text-text-muted"
          >
            {tag.name}
          </span>
        ))}
      </div>

      {/* Title + links row */}
      <div className="mt-3 flex items-start justify-between gap-4">
        <h2 className="font-heading text-2xl font-bold text-text md:text-3xl">
          {project.title}
        </h2>
        <div className="flex shrink-0 gap-3 pt-1">
          {project.liveUrl && (
            <span
              className="font-mono text-xs text-text-muted underline underline-offset-4 transition-colors group-hover:text-accent"
              onClick={(e) => {
                e.preventDefault()
                window.open(project.liveUrl, '_blank', 'noopener,noreferrer')
              }}
            >
              Demo
            </span>
          )}
          {project.githubUrl && (
            <span
              className="font-mono text-xs text-text-muted underline underline-offset-4 transition-colors group-hover:text-accent"
              onClick={(e) => {
                e.preventDefault()
                window.open(project.githubUrl, '_blank', 'noopener,noreferrer')
              }}
            >
              GitHub
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      {project.tagline && (
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-text-muted">
          {project.tagline}
        </p>
      )}

      {/* Tech stack */}
      {project.techStackRefs && project.techStackRefs.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {project.techStackRefs.map((tech) => (
            <span
              key={tech._id}
              className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs text-text-muted"
            >
              {tech.icon && (
                <Image
                  src={urlFor(tech.icon).width(20).height(20).url()}
                  alt={tech.name}
                  width={20}
                  height={20}
                  className="h-4 w-4 object-contain"
                />
              )}
              {tech.name}
            </span>
          ))}
        </div>
      )}

      {/* Fallback: old string-based tech stack */}
      {(!project.techStackRefs || project.techStackRefs.length === 0) &&
        project.techStack &&
        project.techStack.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {project.techStack.map((name) => (
              <span
                key={name}
                className="rounded-md border border-border px-2.5 py-1 text-xs text-text-muted"
              >
                {name}
              </span>
            ))}
          </div>
        )}
    </Link>
  )
}
