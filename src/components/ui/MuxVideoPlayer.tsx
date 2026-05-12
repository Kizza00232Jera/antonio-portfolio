'use client'

import MuxPlayer from '@mux/mux-player-react'
import { cn } from '@/utils/cn'

interface MuxVideoPlayerProps {
  playbackId: string
  poster?: string
  title?: string
  className?: string
}

export function MuxVideoPlayer({
  playbackId,
  poster,
  title,
  className,
}: MuxVideoPlayerProps) {
  return (
    <MuxPlayer
      playbackId={playbackId}
      poster={poster}
      streamType="on-demand"
      title={title}
      className={cn('aspect-video w-full rounded-xl', className)}
      accentColor="#3b82f6"
      style={{ '--media-object-fit': 'cover' } as Record<string, string>}
    />
  )
}
