import { createImageUrlBuilder } from '@sanity/image-url'
import { client } from './client'
import type { SanityImage } from './types'

const builder = createImageUrlBuilder(client)

export function urlFor(source: SanityImage) {
  // auto('format') lets Sanity's CDN serve AVIF/WebP to supporting browsers
  // (with PNG/JPEG fallback) at no extra cost, cutting image weight ~70%.
  return builder.image(source).auto('format')
}
