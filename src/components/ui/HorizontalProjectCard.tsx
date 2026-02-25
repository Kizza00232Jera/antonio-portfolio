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
  return d
    .toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    .toUpperCase()
}

export function HorizontalProjectCard({
  project,
  className,
}: HorizontalProjectCardProps) {
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
      {/* Image area + vertical annotation strip */}
      {thumbnailUrl && (
        <div className="flex">
          {/* Main image */}
          <div className="relative flex-1 aspect-[16/10] overflow-hidden">
            <Image
              src={thumbnailUrl}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 85vw, (max-width: 1024px) 70vw, 50vw"
            />
          </div>

          {/* Right annotation column — date + tags (vertical text) */}
          <div className="flex w-10 shrink-0 flex-col items-center justify-between border-l border-border py-4">
            {project.publishedAt && (
              <span className="[writing-mode:vertical-rl] font-mono text-[10px] uppercase tracking-widest text-text-muted">
                {formatDate(project.publishedAt)}
              </span>
            )}
            {project.tags && project.tags.length > 0 && (
              <div className="[writing-mode:vertical-rl] flex gap-1.5 font-mono text-[10px] uppercase tracking-widest text-text-muted">
                {project.tags.map((tag) => (
                  <span key={tag._id}>{tag.name}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Title + links row */}
      <div className="flex items-start justify-between gap-4 py-4">
        <h2 className="font-heading text-xl font-bold leading-tight text-text md:text-2xl">
          {project.title}
        </h2>
        <div className="flex shrink-0 gap-4 pt-0.5">
          {project.liveUrl && (
            <span
              className="font-mono text-xs uppercase tracking-wider text-text-muted underline underline-offset-4 transition-colors hover:text-accent"
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
              className="font-mono text-xs uppercase tracking-wider text-text-muted underline underline-offset-4 transition-colors hover:text-accent"
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
        <>
          <div className="h-px bg-border" />
          <p className="py-4 text-sm leading-relaxed text-text-muted line-clamp-3">
            {project.tagline}
          </p>
        </>
      )}

      {/* Tech stack */}
      {project.techStackRefs && project.techStackRefs.length > 0 ? (
        <>
          <div className="h-px bg-border" />
          <div className="flex flex-wrap gap-3 pt-4">
            {project.techStackRefs.map((tech) => (
              <span
                key={tech._id}
                className="flex items-center gap-1.5 font-mono text-xs text-text-muted"
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
        </>
      ) : project.techStack && project.techStack.length > 0 ? (
        <>
          <div className="h-px bg-border" />
          <div className="flex flex-wrap gap-3 pt-4">
            {project.techStack.map((name) => (
              <span key={name} className="font-mono text-xs text-text-muted">
                {name}
              </span>
            ))}
          </div>
        </>
      ) : null}
    </Link>
  )
}
