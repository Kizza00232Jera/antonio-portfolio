import { test, expect } from '@playwright/test'

test('home page loads with section titles visible', async ({ page }) => {
  await page.goto('/')

  // SectionTitle renders each letter as an individual span — no spaces in DOM between words
  await expect(page.locator('h2').filter({ hasText: /MYJOURNEY/ })).toBeVisible()
  await expect(page.locator('h2').filter({ hasText: /MYPROJECTS/ })).toBeVisible()
  await expect(page.locator('h2').filter({ hasText: /BLOGS/ })).toBeVisible()
})
