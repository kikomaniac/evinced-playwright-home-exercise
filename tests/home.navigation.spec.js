// TEST A - simple navigation to the home page.
// Evinced mode: ON-DEMAND single scan (evAnalyze).
// Rationale: one static page state, so a single point-in-time scan is enough.
const { test, expect } = require('@playwright/test');
const { existsSync, mkdirSync } = require('node:fs');
const { EvincedSDK } = require('@evinced/js-playwright-sdk');

test('home page loads and is scanned on demand by Evinced', async ({ page }) => {
  mkdirSync('./evincedReports', { recursive: true });
  const reportPath = './evincedReports/A-home-navigation.html';

  const evinced = new EvincedSDK(page);

  // --- navigate ---
  await page.goto('/');

  // --- basic validations that the home page rendered ---
  // (this demo site intentionally ships no <h1>, so assert on stable landmarks instead)
  await expect(page).toHaveTitle(/Love & Minter/i);
  await expect(page.getByRole('navigation', { name: 'main' })).toBeVisible();
  await expect(page.locator('#open-modal')).toBeVisible();

  // --- single accessibility scan of the current page state ---
  const issues = await evinced.evAnalyze();
  await evinced.evSaveFile(issues, 'html', reportPath);

  console.log('[Test A] on-demand scan complete -> ' + reportPath);
  expect(existsSync(reportPath)).toBeTruthy();
});
