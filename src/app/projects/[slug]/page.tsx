import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProjectBySlug } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/image'
import { ProjectDetailPage } from '@/components/project/ProjectDetailPage'

interface ProjectPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
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

  const posterUrl = project.coverImage
    ? urlFor(project.coverImage).width(1920).quality(80).url()
    : undefined

  return <ProjectDetailPage project={project} posterUrl={posterUrl} />
}
