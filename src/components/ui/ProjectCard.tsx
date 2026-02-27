import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/utils/cn'
import { urlFor } from '@/lib/sanity/image'
import type { Project } from '@/lib/sanity/types'

interface ProjectCardProps {
  project: Project
  className?: string
}

export default function ProjectCard({ project, className }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${project.slug.current}`}
      className={cn(
        'group flex flex-col gap-4 rounded-2xl border border-border bg-bg-alt p-6 transition-colors hover:border-accent',
        className
      )}
    >
      {/* Top row — title + arrow */}
      <div className="flex items-start justify-between gap-4">
        <h3
          className="font-heading font-semibold text-text leading-tight text-[length:var(--text-heading)]"
        >
          {project.title}
        </h3>
        <span
          className="mt-1 shrink-0 text-text-muted transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
          aria-hidden
        >
          ↗
        </span>
      </div>

      {/* Tagline */}
      {project.tagline && (
        <p className="text-sm text-text-muted leading-relaxed">
          {project.tagline}
        </p>
      )}

      {/* Tech stack badges (prefer refs with icons, fallback to strings) */}
      {project.techStackRefs && project.techStackRefs.length > 0 ? (
        <ul className="flex flex-wrap gap-2 list-none m-0 p-0 mt-auto pt-2">
          {project.techStackRefs.slice(0, 4).map((tech) => (
            <li
              key={tech._id}
              className="flex items-center gap-1.5 rounded-full border border-border px-3 py-0.5 font-mono text-xs text-text-muted"
            >
              {tech.icon && (
                <Image
                  src={urlFor(tech.icon).width(16).height(16).url()}
                  alt={tech.name}
                  width={16}
                  height={16}
                  className="h-3.5 w-3.5 object-contain"
                />
              )}
              {tech.name}
            </li>
          ))}
          {project.techStackRefs.length > 4 && (
            <li className="rounded-full border border-border px-3 py-0.5 font-mono text-xs text-text-muted">
              +{project.techStackRefs.length - 4}
            </li>
          )}
        </ul>
      ) : project.techStack && project.techStack.length > 0 ? (
        <ul className="flex flex-wrap gap-2 list-none m-0 p-0 mt-auto pt-2">
          {project.techStack.slice(0, 4).map((tech) => (
            <li
              key={tech}
              className="rounded-full border border-border px-3 py-0.5 font-mono text-xs text-text-muted"
            >
              {tech}
            </li>
          ))}
          {project.techStack.length > 4 && (
            <li className="rounded-full border border-border px-3 py-0.5 font-mono text-xs text-text-muted">
              +{project.techStack.length - 4}
            </li>
          )}
        </ul>
      ) : null}
    </Link>
  )
}
