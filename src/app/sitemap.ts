import type { MetadataRoute } from 'next'
import { getAllProjects, getAllBlogPosts } from '@/lib/sanity/queries'
import { SITE, absoluteUrl } from '@/lib/seo'

/**
 * Dynamic sitemap built from Sanity content. Lists the static routes plus every
 * project and blog post so Google can discover and crawl them all. Referenced
 * from robots.ts. Available at /sitemap.xml.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts] = await Promise.all([getAllProjects(), getAllBlogPosts()])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE.url, changeFrequency: 'monthly', priority: 1 },
    { url: absoluteUrl('/projects'), changeFrequency: 'monthly', priority: 0.8 },
    { url: absoluteUrl('/blog'), changeFrequency: 'weekly', priority: 0.8 },
  ]

  const projectRoutes: MetadataRoute.Sitemap = projects.map((p) => ({
    url: absoluteUrl(`/projects/${p.slug.current}`),
    lastModified: p.publishedAt ? new Date(p.publishedAt) : undefined,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: absoluteUrl(`/blog/${post.slug.current}`),
    lastModified: post.publishedAt ? new Date(post.publishedAt) : undefined,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...staticRoutes, ...projectRoutes, ...postRoutes]
}
