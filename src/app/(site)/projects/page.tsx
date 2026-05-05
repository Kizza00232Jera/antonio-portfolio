import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import { getAllProjects, getAllTags } from '@/lib/sanity/queries'
import { ProjectsListingClient } from '@/components/sections/ProjectsListingClient'
import { LenisStop } from '@/components/providers/LenisStop'

export const metadata: Metadata = {
  title: 'Projects | Antonio',
  description:
    "A collection of projects I've built — from web apps to experiments.",
}

export default async function ProjectsPage() {
  const [projects, tags] = await Promise.all([getAllProjects(), getAllTags()])

  return (
    <div className="relative md:h-dvh md:overflow-hidden">
      <LenisStop />
      <ProjectsListingClient projects={projects} tags={tags} />
      <Header />
    </div>
  )
}
