'use client'

import { cn } from '@/utils/cn'

interface WavyBackgroundProps {
  className?: string
}

const waves = [
  { d: 'M0 100 Q200 60 400 100 Q600 140 800 100 Q1000 60 1200 100 Q1400 140 1600 100', duration: '8s', delay: '0s', opacity: 0.08 },
  { d: 'M0 120 Q200 80 400 120 Q600 160 800 120 Q1000 80 1200 120 Q1400 160 1600 120', duration: '10s', delay: '-2s', opacity: 0.06 },
  { d: 'M0 80 Q200 40 400 80 Q600 120 800 80 Q1000 40 1200 80 Q1400 120 1600 80', duration: '12s', delay: '-4s', opacity: 0.1 },
  { d: 'M0 140 Q200 100 400 140 Q600 180 800 140 Q1000 100 1200 140 Q1400 180 1600 140', duration: '9s', delay: '-1s', opacity: 0.05 },
  { d: 'M0 60 Q200 20 400 60 Q600 100 800 60 Q1000 20 1200 60 Q1400 100 1600 60', duration: '11s', delay: '-3s', opacity: 0.07 },
]

export function WavyBackground({ className }: WavyBackgroundProps) {
  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      <svg
        viewBox="0 0 1600 200"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        {waves.map((wave, i) => (
          <path
            key={i}
            d={wave.d}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="1.5"
            opacity={wave.opacity}
            style={{
              animation: `wave-float ${wave.duration} ease-in-out infinite`,
              animationDelay: wave.delay,
              willChange: 'transform',
            }}
          />
        ))}
      </svg>
    </div>
  )
}
