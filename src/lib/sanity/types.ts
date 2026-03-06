import type { PortableTextBlock } from '@portabletext/react'

export interface SanityImage {
  _type: 'image'
  asset: {
    _ref: string
    _type: 'reference'
  }
  hotspot?: {
    x: number
    y: number
    height: number
    width: number
  }
}

export interface SanitySlug {
  _type: 'slug'
  current: string
}

export interface TechStackItem {
  _id: string
  _type: 'techStackItem'
  name: string
  slug: SanitySlug
  icon?: SanityImage
}

export interface Tag {
  _id: string
  _type: 'tag'
  name: string
  slug: SanitySlug
}

export interface ProjectSectionLink {
  _key: string
  label?: string
  url?: string
}

export interface ProjectSection {
  _key: string
  title: string
  content?: PortableTextBlock[]
  images?: SanityImage[]
  links?: ProjectSectionLink[]
}

export interface Project {
  _id: string
  _type: 'project'
  title: string
  slug: SanitySlug
  tagline?: string
  description?: PortableTextBlock[]
  coverImage?: SanityImage
  muxVideoId?: string
  focusAreas?: string[]
  techStack?: string[]
  techStackRefs?: TechStackItem[]
  tags?: Tag[]
  sections?: ProjectSection[]
  githubUrl?: string
  liveUrl?: string
  featured: boolean
  order?: number
  publishedAt?: string
}

export interface BlogPost {
  _id: string
  _type: 'blogPost'
  title: string
  slug: SanitySlug
  publishedAt: string
  excerpt?: string
  body?: PortableTextBlock[]
  muxVideoId?: string
  githubUrl?: string
  appUrl?: string
  heroImage?: SanityImage
  author?: string
  tags?: string[]
  relatedPosts?: Pick<BlogPost, '_id' | 'title' | 'slug'>[]
}

export interface Author {
  _id: string
  _type: 'author'
  name: string
  slug: SanitySlug
  image?: SanityImage
  bio?: string
  githubUrl?: string
  linkedinUrl?: string
}

export interface SiteSettings {
  _id: string
  _type: 'siteSettings'
  title?: string
  description?: string
  author?: Author
  ogImage?: SanityImage
}
