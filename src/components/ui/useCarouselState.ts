import { useState, useEffect, useRef, useCallback } from 'react'

export function useCarouselState(panelCount: number, intervalMs = 5000) {
  const [activePanel, setActivePanel] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setActivePanel(prev => (prev + 1) % panelCount)
    }, intervalMs)
  }, [panelCount, intervalMs])

  const goToPanel = useCallback((index: number) => {
    setActivePanel(index)
    startTimer()
  }, [startTimer])

  useEffect(() => {
    startTimer()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [startTimer])

  return { activePanel, goToPanel }
}
