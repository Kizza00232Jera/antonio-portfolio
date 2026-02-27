import Link from 'next/link'
import ProjectCard from '@/components/ui/ProjectCard'
import type { Project } from '@/lib/sanity/types'

interface FeaturedProjectsSectionProps {
  projects: Project[]
}

export default function FeaturedProjectsSection({ projects }: FeaturedProjectsSectionProps) {
  return (
    <section className="mx-auto max-w-[var(--max-width)] px-6 py-[var(--section-gap)]">
      <div className="flex items-end justify-between gap-4 mb-10">
        <div>
          <p className="mb-3 font-ui text-sm text-text-muted uppercase tracking-widest">
            Work
          </p>
          <h2
            className="font-heading font-bold text-text leading-tight text-[length:var(--text-display)]"
          >
            Featured projects
          </h2>
        </div>

        <Link
          href="/projects"
          className="shrink-0 text-sm font-medium text-text-muted underline underline-offset-4 decoration-border hover:text-text hover:decoration-accent transition-colors"
        >
          All projects →
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="text-sm text-text-muted">Projects coming soon.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 list-none m-0 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <li key={project._id}>
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
