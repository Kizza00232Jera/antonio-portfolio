import { sanityFetch } from './live'
import type { Project, BlogPost, SiteSettings, Tag } from './types'
import {
  ALL_PROJECTS_QUERY,
  FEATURED_PROJECTS_QUERY,
  PROJECT_BY_SLUG_QUERY,
  ALL_TAGS_QUERY,
  ALL_BLOG_POSTS_QUERY,
  LATEST_BLOG_POSTS_QUERY,
  BLOG_POST_BY_SLUG_QUERY,
  SITE_SETTINGS_QUERY,
} from './queries.defined'

// ─── Projects ────────────────────────────────────────────────────────────────

export async function getAllProjects(): Promise<Project[]> {
  const { data } = await sanityFetch({ query: ALL_PROJECTS_QUERY })
  return data as Project[]
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const { data } = await sanityFetch({ query: FEATURED_PROJECTS_QUERY })
  return data as Project[]
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const { data } = await sanityFetch({
    query: PROJECT_BY_SLUG_QUERY,
    params: { slug },
  })
  return data as Project | null
}

// ─── Tags ────────────────────────────────────────────────────────────────────

export async function getAllTags(): Promise<Tag[]> {
  const { data } = await sanityFetch({ query: ALL_TAGS_QUERY })
  return data as Tag[]
}

// ─── Blog ─────────────────────────────────────────────────────────────────────

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const { data } = await sanityFetch({ query: ALL_BLOG_POSTS_QUERY })
  return data as BlogPost[]
}

export async function getLatestBlogPosts(count = 3): Promise<BlogPost[]> {
  const { data } = await sanityFetch({
    query: LATEST_BLOG_POSTS_QUERY,
    params: { count },
  })
  return data as BlogPost[]
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data } = await sanityFetch({
    query: BLOG_POST_BY_SLUG_QUERY,
    params: { slug },
  })
  return data as BlogPost | null
}

// ─── Site Settings ────────────────────────────────────────────────────────────

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const { data } = await sanityFetch({ query: SITE_SETTINGS_QUERY })
  return data as SiteSettings | null
}
