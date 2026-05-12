import { test, expect } from '@playwright/test'

test('project detail close button navigates back to /projects', async ({ page }) => {
  // Resolve a real project slug from the listing page
  await page.goto('/projects')
  const firstCard = page.locator('a[href^="/projects/"]').first()
  const projectHref = await firstCard.getAttribute('href')
  expect(projectHref).toBeTruthy()

  // Navigate directly so the custom card click handler is bypassed
  await page.goto(projectHref!)

  // Entrance animation runs — wait for the close button to be visible
  const closeButton = page.getByRole('button', { name: 'Back to projects' }).first()
  await expect(closeButton).toBeVisible()
  await closeButton.click()

  await expect(page).toHaveURL(/\/projects$/)
})
