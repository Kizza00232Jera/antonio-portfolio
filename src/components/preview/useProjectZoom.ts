'use client'

import { useCallback } from 'react'
import { useProjectTransition } from '@/contexts/ProjectTransitionContext'
import { getThumbnailUrl } from '@/utils/project'
import type { Project } from '@/lib/sanity/types'

/**
 * Shared FLIP-zoom trigger for the projects-page previews.
 * Pass the project and the element whose rect the zoom should grow from
 * (the visible image / floating preview). Reuses the global TransitionOverlay.
 */
export function useProjectZoom() {
  const { startTransition } = useProjectTransition()

  return useCallback(
    (project: Project, fromEl: HTMLElement | null) => {
      const thumbnailUrl = getThumbnailUrl(project)
      if (!fromEl || !thumbnailUrl) return
      const rect = fromEl.getBoundingClientRect()
      startTransition({
        slug: project.slug.current,
        thumbnailUrl,
        imageRect: {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        },
        projectTitle: project.title,
        publishedAt: project.publishedAt,
        githubUrl: project.githubUrl,
        liveUrl: project.liveUrl,
        muxVideoId: project.muxVideoId,
      })
    },
    [startTransition],
  )
}
