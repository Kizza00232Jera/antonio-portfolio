import { urlFor } from '@/lib/sanity/image'
import type { Project } from '@/lib/sanity/types'

export function padIndex(i: number): string {
  return String(i + 1).padStart(2, '0')
}

export function getThumbnailUrl(project: Project, width = 1200): string | null {
  const height = Math.round((width * 3) / 4)
  if (project.thumbnailImage) {
    return urlFor(project.thumbnailImage).width(width).quality(80).url()
  }
  if (project.muxVideoId) {
    return `https://image.mux.com/${project.muxVideoId}/thumbnail.webp?width=${width}&height=${height}&fit_mode=smartcrop`
  }
  if (project.coverImage) {
    return urlFor(project.coverImage).width(width).quality(80).url()
  }
  return null
}
