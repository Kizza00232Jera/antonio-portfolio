import { client } from './client'
import type { Project, BlogPost, SiteSettings } from './types'

// ─── Projects ────────────────────────────────────────────────────────────────

export async function getAllProjects(): Promise<Project[]> {
  return client.fetch(
    `*[_type == "project"] | order(order asc) {
      _id, _type, title, slug, tagline, coverImage,
      techStack, featured, order, publishedAt
    }`
  )
}

export async function getFeaturedProjects(): Promise<Project[]> {
  return client.fetch(
    `*[_type == "project" && featured == true] | order(order asc) {
      _id, _type, title, slug, tagline, coverImage,
      techStack, featured, order, publishedAt
    }`
  )
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  return client.fetch(
    `*[_type == "project" && slug.current == $slug][0] {
      _id, _type, title, slug, tagline, description,
      coverImage, muxVideoId, focusAreas, techStack,
      githubUrl, liveUrl, featured, order, publishedAt
    }`,
    { slug }
  )
}

// ─── Blog ─────────────────────────────────────────────────────────────────────

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  return client.fetch(
    `*[_type == "blogPost"] | order(publishedAt desc) {
      _id, _type, title, slug, publishedAt, excerpt, tags
    }`
  )
}

export async function getLatestBlogPosts(count = 3): Promise<BlogPost[]> {
  return client.fetch(
    `*[_type == "blogPost"] | order(publishedAt desc) [0...$count] {
      _id, _type, title, slug, publishedAt, excerpt, tags
    }`,
    { count }
  )
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  return client.fetch(
    `*[_type == "blogPost" && slug.current == $slug][0] {
      _id, _type, title, slug, publishedAt, excerpt,
      body, muxVideoId, githubUrl, appUrl, tags,
      relatedProject->{ _id, title, slug, tagline }
    }`,
    { slug }
  )
}

// ─── Site Settings ────────────────────────────────────────────────────────────

export async function getSiteSettings(): Promise<SiteSettings | null> {
  return client.fetch(
    `*[_type == "siteSettings"][0] {
      _id, _type, title, description,
      author->{ _id, name, bio, githubUrl, linkedinUrl },
      ogImage
    }`
  )
}
