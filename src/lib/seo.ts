import type { Metadata } from 'next'

/**
 * Single source of truth for SEO across the site.
 *
 * The goal is entity disambiguation: several public figures share the name
 * "Antonio Jerković", so every page reinforces, in a machine-readable way,
 * that THIS site is about Antonio the web developer in Stockholm. The name,
 * role, location and verified social profiles below feed both the page
 * metadata (title/description/OpenGraph/Twitter) and the JSON-LD structured
 * data (Person / WebSite / BlogPosting / CreativeWork).
 */
export const SITE = {
  // Canonical production origin. Override with NEXT_PUBLIC_SITE_URL if needed.
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://antoniojerkovic.com').replace(/\/$/, ''),
  // Full name with diacritic is the primary entity name; the ASCII spelling
  // is an alternateName so the bare "Jerkovic" search also resolves here.
  name: 'Antonio Jerković',
  nameAscii: 'Antonio Jerkovic',
  jobTitle: 'Web Developer',
  role: 'Web Developer and Designer',
  locality: 'Stockholm',
  country: 'Sweden',
  countryCode: 'SE',
  locale: 'en_US',
  defaultTitle: 'Antonio Jerković | Web Developer in Stockholm',
  defaultDescription:
    'Antonio Jerković is a web developer and designer based in Stockholm, Sweden. Portfolio of web and mobile projects, plus writing on building for the web.',
  twitterHandle: '@Kizza00232Jera',
  email: 'antonio.jera10@gmail.com',
  social: {
    linkedin: 'https://www.linkedin.com/in/antonio00232/',
    github: 'https://github.com/Kizza00232Jera',
    x: 'https://x.com/Kizza00232Jera',
  },
} as const

/** Profiles that prove this site and the person are the same entity. */
export const SAME_AS: string[] = [SITE.social.linkedin, SITE.social.github, SITE.social.x]

/** Append the name to a page title so the name appears on every tab/SERP line. */
export function titleWithName(pageTitle: string): string {
  return `${pageTitle} | ${SITE.name}`
}

/** Turn a relative path into an absolute URL on the canonical origin. */
export function absoluteUrl(path = '/'): string {
  if (path.startsWith('http')) return path
  return `${SITE.url}${path.startsWith('/') ? path : `/${path}`}`
}

type BuildMetadataInput = {
  /** Final, human-readable title. Used verbatim (no template suffixing). */
  title: string
  description: string
  /** Pathname for canonical + og:url, e.g. "/projects/nordhem". */
  path?: string
  /** Absolute (or root-relative) image URL. Falls back to the generated default OG image. */
  image?: string
  type?: 'website' | 'article' | 'profile'
  publishedTime?: string
}

/**
 * The "smart, always-filled" metadata builder. Every page routes through this,
 * so a page can never ship without a title, description, canonical URL,
 * OpenGraph and Twitter card. Callers pass derived values (from Sanity title /
 * tagline / excerpt) or an explicit SEO override; either way the output is complete.
 */
export function buildPageMetadata({
  title,
  description,
  path = '/',
  image,
  type = 'website',
  publishedTime,
}: BuildMetadataInput): Metadata {
  const url = absoluteUrl(path)
  // Per-page image (project cover / blog hero) wins; otherwise the route-level
  // generated opengraph-image is used automatically by Next when images is omitted.
  const images = image ? [{ url: image }] : undefined

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE.name,
      type,
      locale: SITE.locale,
      ...(images ? { images } : {}),
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: SITE.twitterHandle,
      ...(images ? { images: images.map((i) => i.url) } : {}),
    },
  }
}

// ─── JSON-LD structured data builders ────────────────────────────────────────

/** The Person entity. This is the keystone for disambiguating the name. */
export function personJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE.url}/#person`,
    name: SITE.name,
    alternateName: SITE.nameAscii,
    url: SITE.url,
    jobTitle: SITE.jobTitle,
    email: `mailto:${SITE.email}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: SITE.locality,
      addressCountry: SITE.countryCode,
    },
    sameAs: SAME_AS,
  }
}

/** The WebSite entity, tied to the Person as its author/publisher. */
export function webSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE.url}/#website`,
    url: SITE.url,
    name: SITE.name,
    inLanguage: 'en',
    author: { '@id': `${SITE.url}/#person` },
    publisher: { '@id': `${SITE.url}/#person` },
  }
}

export function blogPostingJsonLd(input: {
  title: string
  description: string
  path: string
  image?: string
  datePublished?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: input.title,
    description: input.description,
    url: absoluteUrl(input.path),
    mainEntityOfPage: absoluteUrl(input.path),
    ...(input.image ? { image: input.image } : {}),
    ...(input.datePublished ? { datePublished: input.datePublished } : {}),
    author: { '@type': 'Person', '@id': `${SITE.url}/#person`, name: SITE.name, url: SITE.url },
  }
}

export function creativeWorkJsonLd(input: {
  title: string
  description: string
  path: string
  image?: string
  dateCreated?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: input.title,
    description: input.description,
    url: absoluteUrl(input.path),
    ...(input.image ? { image: input.image } : {}),
    ...(input.dateCreated ? { dateCreated: input.dateCreated } : {}),
    author: { '@type': 'Person', '@id': `${SITE.url}/#person`, name: SITE.name, url: SITE.url },
  }
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}
