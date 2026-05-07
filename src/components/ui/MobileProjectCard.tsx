import Image from 'next/image'
import Link from 'next/link'
import type { Project } from '@/lib/sanity/types'
import { getThumbnailUrl, padIndex } from '@/utils/project'

interface MobileProjectCardProps {
  project: Project
  index: number
}

export function MobileProjectCard({ project, index }: MobileProjectCardProps) {
  const thumbnailUrl = getThumbnailUrl(project)

  return (
    <Link
      href={`/projects/${project.slug.current}`}
      className="block border-b border-border last:border-b-0"
    >
      {thumbnailUrl && (
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <Image
            src={thumbnailUrl}
            alt={project.title}
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
      )}
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-body text-lg font-medium leading-snug text-text">
            {project.title}
          </h2>
          <span className="shrink-0 pt-1 font-ui text-[0.625rem] text-text-muted">
            {padIndex(index)}
          </span>
        </div>
        {project.tagline && (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-text-muted">
            {project.tagline}
          </p>
        )}
        {project.tags && project.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 font-ui text-[0.625rem] uppercase tracking-wider text-text-muted">
            {project.tags.map((tag) => (
              <span key={tag._id}>{tag.name}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
