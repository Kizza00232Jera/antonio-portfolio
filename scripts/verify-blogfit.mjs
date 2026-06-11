/* Verifies the homepage blog list fits its row count to the viewport:
   loads the page at several sizes and reports visible rows vs section bounds. */
import { chromium } from '../node_modules/.pnpm/playwright-core@1.59.1/node_modules/playwright-core/index.mjs'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const port = process.argv[2] ?? '3000'
const browsersDir = join(process.env.LOCALAPPDATA, 'ms-playwright')
const exeCandidates = [
  join(browsersDir, 'chromium-1208', 'chrome-win64', 'chrome.exe'),
  join(browsersDir, 'chromium-1208', 'chrome-win', 'chrome.exe'),
]
const executablePath = exeCandidates.find(existsSync)
const browser = await chromium.launch({ executablePath })

const sizes = [
  { width: 1440, height: 700, name: 'short laptop' },
  { width: 1440, height: 900, name: 'laptop      ' },
  { width: 1920, height: 1300, name: 'tall desktop' },
  { width: 390, height: 844, name: 'phone       ' },
]

for (const { width, height, name } of sizes) {
  const page = await browser.newPage({ viewport: { width, height } })
  await page.goto(`http://localhost:${port}/`, { waitUntil: 'load', timeout: 60000 })
  await page.waitForTimeout(5000)
  const r = await page.evaluate(() => {
    const isMobile = window.matchMedia('(max-width: 767px)').matches
    const container = isMobile
      ? document.querySelector('.blog-mobile-list')
      : document.querySelector('.blog-list')
    if (!container) return { error: 'list not found' }
    const section = container.closest('section')
    const rows = Array.from(container.children)
    const sectionBottom = section.getBoundingClientRect().bottom
    const sectionTop = section.getBoundingClientRect().top
    const lastBottom = rows.length
      ? rows[rows.length - 1].getBoundingClientRect().bottom
      : 0
    return {
      rows: rows.length,
      overflows: lastBottom > sectionBottom + 1,
      lastRowBottom: Math.round(lastBottom - sectionTop),
      sectionHeight: Math.round(sectionBottom - sectionTop),
    }
  })
  console.log(
    `${name} ${width}x${height}: rows=${r.rows} sectionH=${r.sectionHeight}px lastRowBottom=${r.lastRowBottom}px ` +
    (r.overflows ? 'OVERFLOWS!' : 'fits')
  )
  await page.close()
}

await browser.close()
