// One-time / on-demand bulk IndexNow submission.
// Reads every URL from the live sitemap and submits them in a single request
// to IndexNow (Bing, Yandex, Seznam, Naver, ...). Run this AFTER the key file
// at /<key>.txt is deployed and live, otherwise verification fails.
//
// Usage:
//   node scripts/indexnow-submit-all.mjs
//   SITE_URL=https://antoniojerkovic.com INDEXNOW_KEY=xxxx node scripts/indexnow-submit-all.mjs

const SITE_URL = (process.env.SITE_URL ?? 'https://antoniojerkovic.com').replace(/\/$/, '')
const KEY = process.env.INDEXNOW_KEY ?? '13601da384111a22569108d3a53e6772'
const host = new URL(SITE_URL).host

async function main() {
  // 1. Pull URLs from the live sitemap.
  const sitemapRes = await fetch(`${SITE_URL}/sitemap.xml`)
  if (!sitemapRes.ok) throw new Error(`sitemap fetch failed: ${sitemapRes.status}`)
  const xml = await sitemapRes.text()
  const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim())

  if (urlList.length === 0) throw new Error('no <loc> URLs found in sitemap')
  console.log(`Found ${urlList.length} URLs in sitemap. Submitting to IndexNow...`)

  // 2. Verify the key file is reachable (IndexNow needs it to confirm ownership).
  const keyRes = await fetch(`${SITE_URL}/${KEY}.txt`)
  if (!keyRes.ok) {
    throw new Error(
      `key file ${SITE_URL}/${KEY}.txt not reachable (${keyRes.status}). Deploy first.`,
    )
  }

  // 3. Submit (IndexNow accepts up to 10,000 URLs per request).
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host,
      key: KEY,
      keyLocation: `${SITE_URL}/${KEY}.txt`,
      urlList,
    }),
  })

  console.log(`IndexNow responded: ${res.status} ${res.statusText}`)
  if (res.ok || res.status === 202) {
    console.log(`Submitted ${urlList.length} URLs successfully.`)
  } else {
    console.error('Submission failed. Body:', await res.text().catch(() => ''))
    process.exit(1)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
