import { test, expect } from '@playwright/test'

test('home renders title', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Pokémon Quiz' })).toBeVisible()
})

