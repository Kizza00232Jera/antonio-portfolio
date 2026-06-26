import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Header from '@/components/layout/Header'
import ThemeObserver from '@/components/providers/ThemeObserver'
import { getProjectBySlug, getPostsByProject } from '@/lib/sanity/queries'
import { urlFor } from '@/lib/sanity/image'
import { ProjectDetailPage } from '@/components/project/ProjectDetailPage'
import { JsonLd } from '@/components/seo/JsonLd'
import {
  SITE,
  buildPageMetadata,
  titleWithName,
  creativeWorkJsonLd,
  breadcrumbJsonLd,
} from '@/lib/seo'

interface ProjectPageProps {
  params: Promise<{ slug: string }>
}

/** Build a 1200x630 social image from the project cover. */
function projectOgImage(project: Awaited<ReturnType<typeof getProjectBySlug>>): string | undefined {
  if (!project) return undefined
  if (project.seo?.ogImageUrl) return project.seo.ogImageUrl
  if (project.coverImage) {
    return urlFor(project.coverImage).width(1200).height(630).fit('crop').quality(80).url()
  }
  return undefined
}

/** Smart-derived SEO for a project: explicit override, else title + tagline. */
function projectSeo(project: NonNullable<Awaited<ReturnType<typeof getProjectBySlug>>>) {
  return {
    title: project.seo?.metaTitle ?? titleWithName(project.title),
    description:
      project.seo?.metaDescription ??
      project.tagline ??
      `${project.title}, a project by ${SITE.name}.`,
    path: `/projects/${project.slug.current}`,
    image: projectOgImage(project),
  }
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params
  const project = await getProjectBySlug(slug)

  if (!project) {
    return { title: 'Project not found' }
  }

  return buildPageMetadata(projectSeo(project))
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params
  const project = await getProjectBySlug(slug)

  if (!project) {
    notFound()
  }

  const relatedPosts = await getPostsByProject(project._id)

  const posterUrl = project.coverImage
    ? urlFor(project.coverImage).width(1920).height(1080).quality(80).url()
    : undefined

  const seo = projectSeo(project)

  return (
    <div className="relative">
      <JsonLd
        data={[
          creativeWorkJsonLd({
            title: project.title,
            description: seo.description,
            path: seo.path,
            image: seo.image,
            dateCreated: project.publishedAt,
          }),
          breadcrumbJsonLd([
            { name: 'Projects', path: '/projects' },
            { name: project.title, path: seo.path },
          ]),
        ]}
      />
      <ThemeObserver />
      <Header />
      <ProjectDetailPage project={project} posterUrl={posterUrl} relatedPosts={relatedPosts} />
    </div>
  )
}
