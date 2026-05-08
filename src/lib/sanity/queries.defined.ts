import { defineQuery } from 'next-sanity'

// ─── Projects ────────────────────────────────────────────────────────────────

export const ALL_PROJECTS_QUERY = defineQuery(
  `*[_type == "project"] | order(order asc) {
    _id, _type, title, slug, tagline, coverImage, thumbnailImage, muxVideoId,
    techStack,
    techStackRefs[]->{ _id, name, slug, icon },
    tags[]->{ _id, name, slug },
    githubUrl, liveUrl, featured, order, publishedAt
  }`
)

export const FEATURED_PROJECTS_QUERY = defineQuery(
  `*[_type == "project" && featured == true] | order(order asc) {
    _id, _type, title, slug, tagline, coverImage, thumbnailImage, muxVideoId,
    techStack,
    techStackRefs[]->{ _id, name, slug, icon },
    tags[]->{ _id, name, slug },
    featured, order, publishedAt
  }`
)

export const PROJECT_BY_SLUG_QUERY = defineQuery(
  `*[_type == "project" && slug.current == $slug][0] {
    _id, _type, title, slug, tagline, description,
    coverImage, thumbnailImage, muxVideoId, focusAreas, techStack,
    techStackRefs[]->{ _id, name, slug, icon },
    tags[]->{ _id, name, slug },
    sections[]{ _key, title, content, images, links },
    githubUrl, liveUrl, featured, order, publishedAt
  }`
)

// ─── Tags ────────────────────────────────────────────────────────────────────

export const ALL_TAGS_QUERY = defineQuery(
  `*[_type == "tag"] | order(name asc) {
    _id, _type, name, slug
  }`
)

// ─── Blog ─────────────────────────────────────────────────────────────────────

export const ALL_BLOG_POSTS_QUERY = defineQuery(
  `*[_type == "blogPost"] | order(publishedAt desc) {
    _id, _type, title, slug, publishedAt, excerpt,
    tags[]->{ _id, name, "slug": slug.current },
    heroImage, author->{ name }
  }`
)

export const LATEST_BLOG_POSTS_QUERY = defineQuery(
  `*[_type == "blogPost"] | order(publishedAt desc) [0...$count] {
    _id, _type, title, slug, publishedAt, excerpt,
    tags[]->{ _id, name, "slug": slug.current },
    heroImage, author->{ name }
  }`
)

export const BLOG_POST_BY_SLUG_QUERY = defineQuery(
  `*[_type == "blogPost" && slug.current == $slug][0] {
    _id, _type, title, slug, publishedAt, excerpt,
    body, muxVideoId, githubUrl, appUrl,
    tags[]->{ _id, name, "slug": slug.current },
    heroImage, author->{ name, githubUrl, linkedinUrl }
  }`
)

export const RELATED_POSTS_QUERY = defineQuery(
  `*[_type == "blogPost" && slug.current != $slug && count(tags[]._ref[@ in $tagIds]) > 0]
  | order(publishedAt desc)[0...10] {
    _id, title, slug, publishedAt,
    tags[]->{ _id }
  }`
)

// ─── Site Settings ────────────────────────────────────────────────────────────

export const SITE_SETTINGS_QUERY = defineQuery(
  `*[_type == "siteSettings"][0] {
    _id, _type, title, description,
    author->{ _id, name, bio, githubUrl, linkedinUrl, phoneCroatian, phoneSwedish, email },
    "ogImageUrl": ogImage.asset->url
  }`
)
