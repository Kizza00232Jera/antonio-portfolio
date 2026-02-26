'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export interface StoredRect {
  left: number
  top: number
  width: number
  height: number
}

export interface TransitionImageData {
  slug: string
  thumbnailUrl: string
  imageRect: StoredRect
  projectTitle: string
  publishedAt?: string
  githubUrl?: string
  liveUrl?: string
  muxVideoId?: string
}

interface ProjectTransitionContextValue {
  isTransitioning: boolean
  transitionData: TransitionImageData | null
  direction: 'enter' | 'exit' | null
  startTransition: (data: TransitionImageData) => void
  completeTransition: () => void
  startExitTransition: () => void
}

const ProjectTransitionContext = createContext<ProjectTransitionContextValue | null>(null)

export function ProjectTransitionProvider({ children }: { children: ReactNode }) {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionData, setTransitionData] = useState<TransitionImageData | null>(null)
  const [direction, setDirection] = useState<'enter' | 'exit' | null>(null)

  const startTransition = useCallback((data: TransitionImageData) => {
    if (isTransitioning) return
    setTransitionData(data)
    setDirection('enter')
    setIsTransitioning(true)
  }, [isTransitioning])

  const completeTransition = useCallback(() => {
    setIsTransitioning(false)
    setDirection(null)
    // Keep transitionData so the detail page can use it for exit
  }, [])

  const startExitTransition = useCallback(() => {
    if (isTransitioning) return
    setDirection('exit')
    setIsTransitioning(true)
  }, [isTransitioning])

  return (
    <ProjectTransitionContext.Provider
      value={{
        isTransitioning,
        transitionData,
        direction,
        startTransition,
        completeTransition,
        startExitTransition,
      }}
    >
      {children}
    </ProjectTransitionContext.Provider>
  )
}

export function useProjectTransition(): ProjectTransitionContextValue {
  const context = useContext(ProjectTransitionContext)
  if (!context) {
    throw new Error('useProjectTransition must be used within a ProjectTransitionProvider')
  }
  return context
}
