import { test, expect } from '@playwright/test'

test('mobile navigation opens and contains Projects link', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')

  const menuButton = page.getByRole('button', { name: 'Open navigation menu' })
  await expect(menuButton).toBeVisible()

  await menuButton.click()

  // NavOverlay fades in via GSAP — wait for the Projects link to become visible
  await expect(
    page.locator('nav[aria-label="Main navigation"] a[href="/projects"]'),
  ).toBeVisible()
})
