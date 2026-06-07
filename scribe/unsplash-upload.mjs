#!/usr/bin/env node
// unsplash-upload.mjs
//
// Searches Unsplash for a query, picks the first matching landscape photo,
// downloads it, uploads it to Sanity, and patches a document field to reference
// the uploaded asset.
//
// Usage:
//   node scribe/unsplash-upload.mjs "<search query>" <documentId> [fieldPath]
//
// Defaults fieldPath to "heroImage". The documentId can be a published or
// drafts.* id; for blog drafts you'll pass drafts.<uuid>.
//
// Required env vars (loaded from .env.local at repo root):
//   UNSPLASH_ACCESS_KEY              — register at https://unsplash.com/developers
//   NEXT_PUBLIC_SANITY_PROJECT_ID
//   NEXT_PUBLIC_SANITY_DATASET
//   SANITY_API_WRITE_TOKEN
//
// On success prints a single JSON line to stdout containing the asset id, the
// Unsplash photo id, photographer attribution, and the field that was patched.

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createClient } from '@sanity/client'

// Load .env.local manually (no dotenv dependency).
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
} catch {
  // .env.local missing is fine if env vars are already set
}

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY
const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET
const SANITY_API_WRITE_TOKEN = process.env.SANITY_API_WRITE_TOKEN

function fail(message, exitCode = 1) {
  console.error(message)
  process.exit(exitCode)
}

if (!UNSPLASH_ACCESS_KEY) fail('UNSPLASH_ACCESS_KEY env var not set. Register at https://unsplash.com/developers and add to .env.local.')
if (!SANITY_PROJECT_ID) fail('NEXT_PUBLIC_SANITY_PROJECT_ID env var not set.')
if (!SANITY_DATASET) fail('NEXT_PUBLIC_SANITY_DATASET env var not set.')
if (!SANITY_API_WRITE_TOKEN) fail('SANITY_API_WRITE_TOKEN env var not set.')

const [query, documentId, fieldPathArg] = process.argv.slice(2)
const fieldPath = fieldPathArg || 'heroImage'

if (!query || !documentId) {
  fail('Usage: node scribe/unsplash-upload.mjs "<query>" <documentId> [fieldPath]')
}

// 1. Search Unsplash.
const searchUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=10&orientation=landscape&content_filter=high`
const searchRes = await fetch(searchUrl, {
  headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
})
if (!searchRes.ok) fail(`Unsplash search failed: ${searchRes.status} ${searchRes.statusText}`)
const searchData = await searchRes.json()
if (!searchData.results || searchData.results.length === 0) fail(`No Unsplash results for query: ${query}`)
const photo = searchData.results[0]

// 2. Download the regular-sized image.
const imageRes = await fetch(photo.urls.regular)
if (!imageRes.ok) fail(`Image download failed: ${imageRes.status} ${imageRes.statusText}`)
const imageBuffer = Buffer.from(await imageRes.arrayBuffer())

// 3. Trigger Unsplash download tracking (required by the Unsplash API terms).
try {
  await fetch(photo.links.download_location, {
    headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
  })
} catch {
  // Tracking is best-effort; continue on failure.
}

// 4. Upload to Sanity.
const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  token: SANITY_API_WRITE_TOKEN,
  apiVersion: '2024-12-01',
  useCdn: false,
})

const filename = `unsplash-${photo.id}.jpg`
const asset = await client.assets.upload('image', imageBuffer, {
  filename,
  contentType: 'image/jpeg',
  source: {
    name: 'unsplash',
    id: photo.id,
    url: photo.links.html,
  },
})

// 5. Patch the document field to reference the new asset.
const altText = photo.alt_description || photo.description || query
await client
  .patch(documentId)
  .set({
    [fieldPath]: {
      _type: 'image',
      asset: { _type: 'reference', _ref: asset._id },
      alt: altText,
    },
  })
  .commit({ visibility: 'async' })

// 6. Print result.
console.log(JSON.stringify({
  documentId,
  fieldPath,
  assetId: asset._id,
  unsplashPhotoId: photo.id,
  unsplashUrl: photo.links.html,
  photographer: photo.user.name,
  photographerUrl: photo.user.links.html,
  filename,
  query,
  alt: altText,
}))
