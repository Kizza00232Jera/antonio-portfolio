'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { disableDraftMode } from '@/app/actions'

export function DisableDraftMode() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await disableDraftMode()
          router.refresh()
        })
      }
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        padding: '8px 16px',
        background: '#333',
        color: '#fff',
        border: 'none',
        borderRadius: 6,
        cursor: pending ? 'wait' : 'pointer',
        fontFamily: 'var(--font-jetbrains-mono)',
        fontSize: 13,
        opacity: pending ? 0.6 : 1,
      }}
    >
      {pending ? 'Exiting...' : 'Exit preview mode'}
    </button>
  )
}
