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
  tags?: string[]
  relatedProject?: Project
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
