'use client'

import { cn } from '@/utils/cn'

interface IsometricBackgroundProps {
  className?: string
  variant?: 'light' | 'dark'
}

const lightBlobs = [
  { size: 'w-[60vw] h-[60vh]', position: '-top-[15%] -left-[15%]', stroke: 'rgba(26, 46, 74, 0.2)', duration: '8s', delay: '0s' },
  { size: 'w-[55vw] h-[55vh]', position: 'top-[10%] -right-[10%]', stroke: 'rgba(30, 58, 95, 0.18)', duration: '10s', delay: '-2s' },
  { size: 'w-[50vw] h-[50vh]', position: 'bottom-[5%] left-[20%]', stroke: 'rgba(26, 46, 74, 0.15)', duration: '9s', delay: '-4s' },
  { size: 'w-[35vw] h-[40vh]', position: 'top-[5%] right-[15%]', stroke: 'rgba(59, 130, 246, 0.12)', duration: '7s', delay: '-1s' },
  { size: 'w-[45vw] h-[45vh]', position: '-bottom-[10%] -right-[5%]', stroke: 'rgba(30, 58, 95, 0.15)', duration: '11s', delay: '-6s' },
]

const darkBlobs = [
  { size: 'w-[65vw] h-[65vh]', position: '-top-[20%] -left-[10%]', stroke: 'rgba(59, 130, 246, 0.12)', duration: '9s', delay: '0s' },
  { size: 'w-[50vw] h-[50vh]', position: 'top-[15%] -right-[15%]', stroke: 'rgba(59, 130, 246, 0.1)', duration: '11s', delay: '-3s' },
  { size: 'w-[55vw] h-[55vh]', position: '-bottom-[10%] left-[15%]', stroke: 'rgba(96, 165, 250, 0.08)', duration: '10s', delay: '-5s' },
  { size: 'w-[40vw] h-[45vh]', position: 'top-[30%] right-[5%]', stroke: 'rgba(59, 130, 246, 0.1)', duration: '8s', delay: '-2s' },
  { size: 'w-[45vw] h-[40vh]', position: 'bottom-[20%] -left-[5%]', stroke: 'rgba(96, 165, 250, 0.07)', duration: '12s', delay: '-7s' },
]

export function IsometricBackground({ className, variant = 'light' }: IsometricBackgroundProps) {
  const blobs = variant === 'dark' ? darkBlobs : lightBlobs

  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      {blobs.map((blob, i) => (
        <div
          key={i}
          className={cn('absolute', blob.size, blob.position)}
          style={{
            backgroundColor: 'transparent',
            border: `1.5px solid ${blob.stroke}`,
            borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
            animation: `blob-morph-${i} ${blob.duration} ease-in-out infinite`,
            animationDelay: blob.delay,
            willChange: 'border-radius, transform',
          }}
        />
      ))}
    </div>
  )
}
