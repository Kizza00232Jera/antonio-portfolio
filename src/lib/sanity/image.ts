import { createImageUrlBuilder } from '@sanity/image-url'
import { client } from './client'
import type { SanityImage } from './types'

const builder = createImageUrlBuilder(client)

/**
 * Build a URL for a Sanity image asset.
 * Usage: sanityImage(project.coverImage).width(800).url()
 */
export function sanityImage(source: SanityImage) {
  return builder.image(source)
}
