#!/usr/bin/env node
// delete-old-posts.mjs
//
// Removes the legacy blog posts that pre-date the Drafter batch:
//   1. The 19 "Why I Chose Next.js App Router for My Portfolio" duplicates.
//   2. The "first bl" stub (which had a stale relatedPosts reference to one of the duplicates).
//
// The 3 real existing Antonio posts (sanity-cms-portfolio-worth-it,
// podcast-summarizer-perplexity-ai, uploadthing-file-upload-nextjs) and the
// 11 Drafter-written posts are NOT touched.
//
// Usage: node scribe/delete-old-posts.mjs

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createClient } from '@sanity/client'

const envPath = resolve(process.cwd(), '.env.local')
try {
  const text = readFileSync(envPath, 'utf8')
  for (const line of text.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (!m) continue
    const [, name, rawValue] = m
    if (process.env[name]) continue
    process.env[name] = rawValue.replace(/^['"]|['"]$/g, '')
  }
} catch {}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: '2024-12-01',
  useCdn: false,
})

const FIRST_BL_ID = '3ca58096-623f-4f03-bf44-4cf69e230268'

const DUPE_IDS = [
  '12f2b439-b8a9-4e1a-a330-3647ef93c404',
  '34ff05fc-647b-47f2-8f02-9e73fdd0de6c',
  '3ba58d27-67a1-4936-845d-958937d200c1',
  '3ef54f0b-5c88-467b-b03e-3ba8a274d265',
  '4e67f1df-fb41-4e90-9bdc-7aca7f8000b2',
  '739f45f8-cf5a-4ae8-9770-32c7b7c166a9',
  '7ae7fb44-4b0c-4660-b892-50cf9a2139f1',
  '85ce8d93-37bc-4351-8086-ef43bc2b5d92',
  '8dc9b42c-810f-4791-8996-a49812a15eab',
  '9224ce34-544e-4c04-bb46-4efdb107a407',
  'aaffedbd-1c12-4f45-8b2d-5cb4f717b512',
  'ac9922ba-f98e-4c50-b6aa-8beba86e2454',
  'b22bd675-5df1-4fc4-86cf-a133fe0ff67a',
  'b9aa1c90-e3b4-4d9a-83fb-51d63ef3d7da',
  'c894bc29-9f7e-4118-8b96-c3c3d8d99697',
  'c94efa9d-8fed-4113-9dd5-d69be5a410fd',
  'eb12478e-65a8-466a-a1a4-0767c0dcb1be',
  'f8ca8bf7-1462-41e6-be67-72c254acb5f7',
  'ff87c400-467f-4e8a-b9e9-3ac65c6f9305',
]

const ALL_TO_DELETE = [FIRST_BL_ID, ...DUPE_IDS]

console.log(`Step 1: clearing relatedPosts on all ${ALL_TO_DELETE.length} docs to break cyclic references.`)
for (const id of ALL_TO_DELETE) {
  try {
    await client.patch(id).unset(['relatedPosts']).commit({ visibility: 'async' })
  } catch (err) {
    console.error(`  patch failed for ${id}: ${err.message}`)
  }
}
console.log('  done')

console.log('\nStep 2: deleting first-bl stub.')
try {
  await client.delete(FIRST_BL_ID)
  console.log('  ok')
} catch (err) {
  console.error(`  failed: ${err.message}`)
  process.exit(1)
}

console.log(`\nStep 3: deleting ${DUPE_IDS.length} duplicates.`)
let success = 0
const failed = []
for (const id of DUPE_IDS) {
  try {
    await client.delete(id)
    success++
  } catch (err) {
    failed.push({ id, err: err.message })
  }
}
console.log(`  ${success}/${DUPE_IDS.length} deleted.`)
if (failed.length > 0) {
  for (const f of failed) console.log(`    - ${f.id}: ${f.err}`)
}

console.log('\nDone.')
