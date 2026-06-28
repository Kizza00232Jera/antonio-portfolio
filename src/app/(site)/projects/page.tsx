import type { Metadata } from 'next'
import { getAllProjects } from '@/lib/sanity/queries'
import { ProjectsListingClient } from '@/components/sections/ProjectsListingClient'
import { LenisStop } from '@/components/providers/LenisStop'
import { buildPageMetadata, titleWithName } from '@/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: titleWithName('Projects'),
  description:
    'Selected work by Antonio Jerković: web and mobile projects, from production apps to experiments.',
  path: '/projects',
})

export default async function ProjectsPage() {
  const projects = await getAllProjects()

  return (
    <div className="relative md:h-dvh md:overflow-hidden">
      <LenisStop />
      <ProjectsListingClient projects={projects} />
    </div>
  )
}
