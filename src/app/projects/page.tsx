import type { Metadata } from 'next'
import ProjectCard from '@/components/ui/ProjectCard'
import { getAllProjects } from '@/lib/sanity/queries'

export const metadata: Metadata = {
  title: 'Projects | Antonio',
  description: 'A collection of projects I\'ve built — from web apps to experiments.',
}

export default async function ProjectsPage() {
  const projects = await getAllProjects()

  return (
    <section className="mx-auto max-w-[var(--max-width)] px-6 py-[var(--section-gap)]">
      <div className="mb-10">
        <p className="mb-3 font-mono text-sm text-text-muted uppercase tracking-widest">
          Work
        </p>
        <h1
          className="font-heading font-bold text-text leading-tight"
          style={{ fontSize: 'var(--text-display)' }}
        >
          All projects
        </h1>
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
