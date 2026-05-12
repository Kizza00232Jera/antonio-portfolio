'use server'

import { draftMode } from 'next/headers'

export async function disableDraftMode(): Promise<void> {
  const draft = await draftMode()
  draft.disable()
}
