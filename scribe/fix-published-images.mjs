#!/usr/bin/env node
// fix-published-images.mjs
//
// One-shot cleanup of the first batch of published blog posts:
//   1. Removes all `image`-type blocks from the body array (AI body images go away).
//   2. Searches Unsplash with a per-post query, uploads the top landscape result,
//      patches the post's `heroImage` to reference the new asset.
//
// These are live published documents, so the patches take effect immediately.
// Body text + code blocks are untouched.
//
// Usage:
//   node scribe/fix-published-images.mjs

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
} catch {}

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY
const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET
const SANITY_API_WRITE_TOKEN = process.env.SANITY_API_WRITE_TOKEN

for (const [name, value] of Object.entries({
  UNSPLASH_ACCESS_KEY,
  NEXT_PUBLIC_SANITY_PROJECT_ID: SANITY_PROJECT_ID,
  NEXT_PUBLIC_SANITY_DATASET: SANITY_DATASET,
  SANITY_API_WRITE_TOKEN,
})) {
  if (!value) {
    console.error(`Missing env var: ${name}`)
    process.exit(1)
  }
}

const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  token: SANITY_API_WRITE_TOKEN,
  apiVersion: '2024-12-01',
  useCdn: false,
})

// Per-post Unsplash queries. Chosen to suggest the topic visually without being
// too literal. If a post's image looks wrong after the batch, re-run
// unsplash-upload.mjs with a different query for just that one.
const POSTS = [
  { id: 'd837dd1f-aa9f-4a47-ad62-8e52cb710e0c', query: 'database security network', label: 'RLS / SECURITY DEFINER' },
  { id: 'd34b78b7-9b61-4705-92f3-293871ab31c0', query: 'smartphone photography camera', label: 'Android image uploads' },
  { id: '907d01a9-ee5c-4cd0-a7a5-e1c53cdb0ecd', query: 'foreign currency exchange', label: 'Base currency' },
  { id: '61e742b8-5789-471a-8e5c-9335aa038ab3', query: 'calculator coins money', label: 'Floor-then-round splits' },
  { id: '45eff365-a304-47db-84ac-893d61f83442', query: 'email envelope mail', label: 'EmailJS migration' },
  { id: 'cd675eb0-aef6-4c54-aa22-a3d976b64621', query: 'calendar planner desk', label: 'Schedule history' },
  { id: 'c3a31f04-a846-4804-b37f-db2260e0d102', query: 'smartphone notification alert', label: 'Web Push iOS' },
  { id: '69c5ed40-7da7-4a2c-9450-35c8caf3ef77', query: 'traffic light highway', label: 'Upstash rate limiting' },
  { id: '45e17bf3-e71c-4eac-adcc-d1436e259f98', query: 'intersection roads aerial', label: 'Parallel + intercepting routes' },
  { id: 'fda268fe-fdb8-4c37-896c-5b437fd22d7f', query: 'shop window display', label: 'Recipe app /demo' },
  { id: '30d1ded9-30e7-494c-a272-c499d95c5540', query: 'smartphone apps home screen', label: 'PWA install banner' },
]

async function stripBodyImages(docId) {
  const doc = await client.getDocument(docId)
  if (!doc || !Array.isArray(doc.body)) return { stripped: 0 }
  const cleanBody = doc.body.filter(block => block._type !== 'image')
  const stripped = doc.body.length - cleanBody.length
  if (stripped === 0) return { stripped: 0 }
  await client.patch(docId).set({ body: cleanBody }).commit({ visibility: 'async' })
  return { stripped }
}

async function attachUnsplashHero(docId, query) {
  const searchUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=10&orientation=landscape&content_filter=high`
  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
  })
  if (!searchRes.ok) throw new Error(`Unsplash search failed: ${searchRes.status}`)
  const searchData = await searchRes.json()
  if (!searchData.results || searchData.results.length === 0) throw new Error(`No Unsplash results for: ${query}`)
  const photo = searchData.results[0]

  const imageRes = await fetch(photo.urls.regular)
  if (!imageRes.ok) throw new Error(`Image download failed: ${imageRes.status}`)
  const imageBuffer = Buffer.from(await imageRes.arrayBuffer())

  try {
    await fetch(photo.links.download_location, {
      headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
    })
  } catch {}

  const asset = await client.assets.upload('image', imageBuffer, {
    filename: `unsplash-${photo.id}.jpg`,
    contentType: 'image/jpeg',
    source: { name: 'unsplash', id: photo.id, url: photo.links.html },
  })

  const altText = photo.alt_description || photo.description || query
  await client
    .patch(docId)
    .set({
      heroImage: {
        _type: 'image',
        asset: { _type: 'reference', _ref: asset._id },
        alt: altText,
      },
    })
    .commit({ visibility: 'async' })

  return {
    assetId: asset._id,
    unsplashPhotoId: photo.id,
    photographer: photo.user.name,
    unsplashUrl: photo.links.html,
  }
}

console.log(`Processing ${POSTS.length} posts...\n`)

let successCount = 0
const failures = []

for (const post of POSTS) {
  const tag = `[${post.label}]`
  try {
    const { stripped } = await stripBodyImages(post.id)
    const result = await attachUnsplashHero(post.id, post.query)
    console.log(`${tag} stripped ${stripped} body image(s) | hero: ${result.unsplashPhotoId} by ${result.photographer} (query: "${post.query}")`)
    successCount++
  } catch (err) {
    console.error(`${tag} FAILED: ${err.message}`)
    failures.push({ ...post, error: err.message })
  }
}

console.log(`\nDone. ${successCount}/${POSTS.length} succeeded.`)
if (failures.length > 0) {
  console.log('Failures:')
  for (const f of failures) console.log(`  - ${f.label} (${f.id}): ${f.error}`)
  process.exit(1)
}
