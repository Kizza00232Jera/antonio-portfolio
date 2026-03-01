'use client'

import { useEffect, useState, useCallback } from 'react'
import { codeToHtml } from 'shiki'

interface CodeBlockProps {
  language?: string
  code?: string
}

export function CodeBlock({ language, code }: CodeBlockProps) {
  const [html, setHtml] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!code) return

    let cancelled = false

    codeToHtml(code, {
      lang: language || 'text',
      theme: 'tokyo-night',
    })
      .then((result) => {
        if (!cancelled) setHtml(result)
      })
      .catch(() => {
        // If the language isn't supported, fall back to plain text
        if (!cancelled) {
          codeToHtml(code, { lang: 'text', theme: 'tokyo-night' }).then((result) => {
            if (!cancelled) setHtml(result)
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [code, language])

  const handleCopy = useCallback(() => {
    if (!code) return
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [code])

  if (!code) return null

  return (
    <div className="my-6 rounded-lg overflow-hidden bg-[#1a1b26]">
      {/* Header: language label + copy button */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
        {language ? (
          <span className="text-xs font-mono text-white/50">{language}</span>
        ) : (
          <span />
        )}
        <button
          onClick={handleCopy}
          className="text-xs font-mono text-white/40 hover:text-white/70 transition-colors cursor-pointer"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Code: Shiki-highlighted or plain fallback */}
      {html ? (
        <div
          className="overflow-x-auto p-4 text-sm leading-relaxed [&_pre]:!bg-transparent [&_code]:!bg-transparent"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="overflow-x-auto p-4">
          <code className="font-mono text-sm text-[#cdd6f4] leading-relaxed">
            {code}
          </code>
        </pre>
      )}
    </div>
  )
}
