'use client'

import { useEffect, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'

// Bundle the PDF.js worker locally (no CDN dependency); Turbopack/webpack emit it.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

interface CvPdfViewerProps {
  file: string
}

export default function CvPdfViewer({ file }: CvPdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [numPages, setNumPages] = useState(0)

  // Render each page at the container's width so the page fills it with no dead space.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => setWidth(el.clientWidth)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="w-full">
      <Document
        file={file}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        loading={
          <div className="py-24 text-center font-ui text-xs uppercase tracking-widest text-gray-400">
            Loading CV…
          </div>
        }
        error={
          <div className="py-24 text-center font-ui text-xs uppercase tracking-widest text-gray-400">
            Could not load CV
          </div>
        }
      >
        {width > 0 &&
          Array.from({ length: numPages }, (_, i) => (
            <Page
              key={i}
              pageNumber={i + 1}
              width={width}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          ))}
      </Document>
    </div>
  )
}
