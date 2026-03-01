'use client'

import { useRef, useCallback } from 'react'
import MuxPlayer from '@mux/mux-player-react'
import { cn } from '@/utils/cn'

interface MuxVideoPlayerProps {
  playbackId: string
  poster?: string
  className?: string
}

export function MuxVideoPlayer({
  playbackId,
  poster,
  className,
}: MuxVideoPlayerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)

  const handleClick = useCallback(() => {
    // The MuxPlayer renders as a custom element with play/pause methods
    const player = wrapperRef.current?.querySelector('mux-player') as
      | (HTMLElement & { paused: boolean; play(): void; pause(): void })
      | null
    if (!player) return
    if (player.paused) {
      player.play()
    } else {
      player.pause()
    }
  }, [])

  return (
    <div
      ref={wrapperRef}
      onClick={handleClick}
      className={cn('cursor-pointer', className)}
    >
      <MuxPlayer
        playbackId={playbackId}
        poster={poster}
        streamType="on-demand"
        title=""
        autoPlay="muted"
        muted
        loop
        nohotkeys
        className="aspect-video w-full rounded-xl"
        style={
          {
            '--media-object-fit': 'cover',
            '--controls': 'none',
            '--center-controls': 'none',
          } as Record<string, string>
        }
      />
    </div>
  )
}
