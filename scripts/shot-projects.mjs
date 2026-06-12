// Ad-hoc visual check: screenshot project hero at several viewports.
// Usage: node scripts/shot-projects.mjs [slug ...]
import { chromium } from '@playwright/test'
import fs from 'node:fs'

const slugs = process.argv.slice(2)
const viewports = [
  { name: 'laptop', width: 1536, height: 800 },
  { name: 'desktop', width: 1920, height: 1080 },
  { name: 'phone', width: 390, height: 844 },
]

fs.mkdirSync('shots', { recursive: true })
const browser = await chromium.launch()
for (const vp of viewports) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } })
  for (const slug of slugs) {
    await page.goto(`http://localhost:3000/projects/${slug}`, { waitUntil: 'load', timeout: 60000 })
    await page.waitForTimeout(2500) // entrance animation + font swap + fit effect
    await page.screenshot({ path: `shots/${slug}-${vp.name}.png` })
    console.log(`${slug}-${vp.name} done`)
  }
  await page.close()
}
await browser.close()
