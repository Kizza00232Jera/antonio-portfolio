import { urlFor } from '@/lib/sanity/image'
import type { Project } from '@/lib/sanity/types'

export function padIndex(i: number): string {
  return String(i + 1).padStart(2, '0')
}

export function getThumbnailUrl(project: Project): string | null {
  if (project.thumbnailImage) {
    return urlFor(project.thumbnailImage).width(1200).quality(80).url()
  }
  if (project.muxVideoId) {
    return `https://image.mux.com/${project.muxVideoId}/thumbnail.png?width=1200&height=900&fit_mode=smartcrop`
  }
  if (project.coverImage) {
    return urlFor(project.coverImage).width(1200).quality(80).url()
  }
  return null
}
