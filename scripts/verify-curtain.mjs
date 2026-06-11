/* Verifies the curtain-stack scroll: at each section boundary the previous
   section must stay frozen (rect unchanged) while the next slides over it.
   Run: node scripts/verify-curtain.mjs [port] */
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
if (!executablePath) throw new Error('chromium executable not found')

const browser = await chromium.launch({ executablePath })
const page = await browser.newPage({ viewportSize: { width: 1440, height: 900 } })
await page.goto(`http://localhost:${port}/`, { waitUntil: 'load', timeout: 60000 })
await page.waitForTimeout(6000) // preloader + entrance animations

const scrollAndMeasure = (selector) =>
  page.evaluate(async (sel) => {
    const el = document.querySelector(sel)
    if (!el) return { error: `not found: ${sel}` }
    const doc = document.documentElement
    // absolute document Y of the element's top
    const elTop = el.getBoundingClientRect().top + doc.scrollTop
    const vh = window.innerHeight
    const measure = () => {
      const r = el.getBoundingClientRect()
      const heroTop = document.querySelector('.hero-section')?.getBoundingClientRect().top
      const jSection = document.querySelector('.j-section')?.getBoundingClientRect().top
      const showcase = document.querySelector('.project-showcase-sticky')?.getBoundingClientRect().top
      return { coverTop: r.top, heroTop, jSection, showcase, scrollY: window.scrollY }
    }
    const settle = () => new Promise((res) => setTimeout(res, 700))
    // position A: covering element 25% into the viewport from the bottom
    window.scrollTo({ top: elTop - vh + vh * 0.25, behavior: 'instant' })
    await settle()
    const a = measure()
    // position B: 300px further down
    window.scrollTo({ top: elTop - vh + vh * 0.25 + 300, behavior: 'instant' })
    await settle()
    const b = measure()
    return { a, b }
  }, selector)

const fmt = (v) => (v == null ? 'n/a' : Math.round(v))
const report = (name, frozenKey, { a, b }) => {
  if (!a) return console.log(`${name}: ERROR`)
  const coverMoved = a.coverTop - b.coverTop
  const frozenMoved = (a[frozenKey] ?? 0) - (b[frozenKey] ?? 0)
  const ok = coverMoved > 250 && Math.abs(frozenMoved) < 5
  console.log(
    `${name}: ${ok ? 'PASS' : 'FAIL'} — cover moved ${fmt(coverMoved)}px, frozen section moved ${fmt(frozenMoved)}px ` +
    `(frozen top A=${fmt(a[frozenKey])}, B=${fmt(b[frozenKey])})`
  )
}

// Boundary 1: hero -> MY JOURNEY title (first section title on the page)
report('hero -> journey ', 'heroTop', await scrollAndMeasure('.hero-section + div'))
// Boundary 2: journey -> MY PROJECTS title
report('journey -> projects', 'jSection', await scrollAndMeasure('.st-overlap-md'))
// Boundary 3: projects -> BLOGS title
report('projects -> blogs', 'showcase', await scrollAndMeasure('.st-overlap-lg'))

await browser.close()
