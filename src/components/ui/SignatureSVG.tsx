'use client'

import { forwardRef, useEffect, useRef, useImperativeHandle } from 'react'
import { cn } from '@/utils/cn'

interface SignatureSVGProps {
  className?: string
}

const SIGNATURE_PATH =
  'M30.5601 95.4175C26.2268 111.751 23.4601 135.217 47.0601 98.4175C56.0601 88.7508 78.0601 55.6175 94.0601 0.41748C95.8935 26.4175 101.56 92.4175 115.56 108.417C122.56 118.417 130.06 120.834 130.06 95.4175C130.06 95.4175 133.06 58.9175 138.06 56.4175C145.727 71.7508 158.76 108.717 149.56 133.917C137.06 150.417 119.66 175.217 130.06 124.417C134.227 117.584 142.26 97.6175 161.06 90.4175L4.56012 84.9175C32.0601 106.417 102.66 141.217 165.06 108.417C199.227 93.0841 247.06 56.7175 165.06 33.9175C141.727 24.0841 88.1601 6.61748 60.5601 15.4175'

export interface SignatureSVGRef {
  pathElement: SVGPathElement | null
  totalLength: number
}

export const SignatureSVG = forwardRef<SignatureSVGRef, SignatureSVGProps>(
  function SignatureSVG({ className }, ref) {
    const pathRef = useRef<SVGPathElement>(null)
    const lengthRef = useRef(0)

    useEffect(() => {
      if (pathRef.current) {
        const len = pathRef.current.getTotalLength()
        lengthRef.current = len
        pathRef.current.style.strokeDasharray = `${len}`
        pathRef.current.style.strokeDashoffset = `${len}`
      }
    }, [])

    useImperativeHandle(ref, () => ({
      get pathElement() {
        return pathRef.current
      },
      get totalLength() {
        return lengthRef.current
      },
    }))

    return (
      <svg
        viewBox="-5 -5 260 185"
        fill="none"
        className={cn('w-full h-full', className)}
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          ref={pathRef}
          d={SIGNATURE_PATH}
          stroke="#3b82f6"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          style={{
            filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))',
          }}
        />
      </svg>
    )
  },
)
