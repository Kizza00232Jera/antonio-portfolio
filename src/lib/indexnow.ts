import { SITE, absoluteUrl } from './seo'

/**
 * IndexNow: instantly notify Bing, Yandex, Seznam, Naver, etc. that a URL was
 * added, updated, or removed. One submission reaches every participating engine.
 *
 * Ownership is proven by a key file hosted at `${SITE.url}/<key>.txt` whose
 * contents equal the key. The key is public by design (the engines fetch it),
 * so it lives in code with an optional env override for rotation.
 *
 * Docs: https://www.indexnow.org/documentation
 */
export const INDEXNOW_KEY = process.env.INDEXNOW_KEY ?? '13601da384111a22569108d3a53e6772'

const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow'

function host(): string {
  return new URL(SITE.url).host
}

/**
 * Submit one or more URLs to IndexNow. Accepts absolute URLs or site-relative
 * paths (which are resolved against the canonical origin). Never throws: on
 * failure it logs and resolves, so it can't break a publish/webhook flow.
 * Returns the HTTP status (or null if nothing was sent).
 */
export async function submitToIndexNow(urlsOrPaths: string[]): Promise<number | null> {
  const urlList = Array.from(
    new Set(urlsOrPaths.filter(Boolean).map((u) => absoluteUrl(u))),
  )
  if (urlList.length === 0) return null

  try {
    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: host(),
        key: INDEXNOW_KEY,
        keyLocation: `${SITE.url}/${INDEXNOW_KEY}.txt`,
        urlList,
      }),
    })
    // 200 = accepted, 202 = accepted (pending verification). Both are success.
    if (!res.ok && res.status !== 202) {
      console.error(`[indexnow] submit failed: ${res.status} ${res.statusText}`, urlList)
    }
    return res.status
  } catch (err) {
    console.error('[indexnow] submit threw:', err)
    return null
  }
}
