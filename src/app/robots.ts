import type { MetadataRoute } from 'next'
import { SITE, absoluteUrl } from '@/lib/seo'

/**
 * robots.txt at /robots.txt. Allows crawling of everything public, blocks the
 * Sanity Studio and Next internals, and points crawlers at the sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/studio', '/api/'],
    },
    sitemap: absoluteUrl('/sitemap.xml'),
    host: SITE.url,
  }
}
