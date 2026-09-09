// EXAMPLE for question #5 - "how to integrate Evinced to all tests at scale".
//
// This spec contains NO Evinced code. It imports the shared base and the
// auto-fixture scans every page it visits. Add 50 more specs like this and
// accessibility coverage comes for free.
const { test, expect } = require('./_base');

test('catalog page is reachable from the home nav', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /catalog/i }).first().click();
  await expect(page).toHaveURL(/collections\/all/);
  await expect(page.getByRole('heading').first()).toBeVisible();
});
