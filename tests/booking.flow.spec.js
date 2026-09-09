// TEST B - complex flow with validations.
// Evinced mode: CONTINUOUS (evStart / evStop).
// Rationale: the flow moves through many DOM states (home -> modal step 1 ->
// required-field errors -> format errors -> step 2 date/time -> step 3 review ->
// step 4 confirmation). Continuous mode analyses every state automatically as the
// DOM mutates - which is the point of "run the analysis on all page states".
//
// Validations exercised:
//   - empty step 1 is blocked, with all three required-field messages
//   - a badly formatted email / too-short phone are also blocked
//   - step 2 "Next" stays disabled until both a date and a time are chosen
//   - the review screen shows the exact values entered in step 1
const { test, expect } = require('@playwright/test');
const { existsSync, mkdirSync } = require('node:fs');
const { EvincedSDK } = require('@evinced/js-playwright-sdk');

test('consultation booking flow - analysed across all states', async ({ page }) => {
  mkdirSync('./evincedReports', { recursive: true });
  const reportPath = './evincedReports/B-booking-flow.html';

  const evinced = new EvincedSDK(page);
  await evinced.evStart();

  // --- State 1: home page ---
  await page.goto('/');
  await expect(page).toHaveTitle(/Love & Minter/i);

  // --- State 2: open the "Book a Consultation" modal (a <dialog>) ---
  await page.locator('#open-modal').click();
  await expect(page.locator('#consultation-modal')).toBeVisible();
  await expect(page.locator('#step-1')).toBeVisible();

  // --- State 3: VALIDATION - try to advance with an empty form ---
  // NB: #next-to-step-2 is permanently aria-disabled="true" (an intentional a11y
  // bug on this demo site - it announces as disabled but still works), so we
  // click with force to bypass Playwright's actionability check.
  await page.locator('#next-to-step-2').click({ force: true });
  await expect(page.getByText('Full Name is required.')).toBeVisible();
  await expect(page.getByText('Please enter a valid email address.')).toBeVisible();
  await expect(page.getByText('Please enter a valid phone number.')).toBeVisible();
  await expect(page.locator('#step-2')).toBeHidden(); // still blocked on step 1

  // --- State 3b: format validation - badly formatted values are also rejected ---
  await page.locator('#full_name').fill('Test User');
  await page.locator('#email').fill('not-an-email');
  await page.locator('#phone').fill('123'); // too short for /^\d{10,15}$/
  await page.locator('#next-to-step-2').click({ force: true });
  // re-validation ran: the now-valid name cleared its error, the two bad fields did not
  await expect(page.getByText('Full Name is required.')).toBeHidden();
  await expect(page.getByText('Please enter a valid email address.')).toBeVisible();
  await expect(page.getByText('Please enter a valid phone number.')).toBeVisible();
  await expect(page.locator('#step-2')).toBeHidden();

  // --- State 4: fill step 1 correctly, advance to step 2 ---
  await page.locator('#full_name').fill('Test User');
  await page.locator('#email').fill('test.user@example.com');
  await page.locator('#phone').fill('5551234567'); // must match /^\d{10,15}$/
  await page.locator('#next-to-step-2').click({ force: true });
  await expect(page.locator('#step-2')).toBeVisible();

  // --- State 5: pick a date (first is preselected) + a time; "Next" then enables ---
  await expect(page.locator('#next-to-step-3')).toBeDisabled();
  await page.locator('label[for^="time-label"]').first().click();
  await expect(page.locator('#next-to-step-3')).toBeEnabled();
  await page.locator('#next-to-step-3').click();

  // --- State 6: review step reflects what we entered ---
  await expect(page.locator('#step-3')).toBeVisible();
  await expect(page.locator('#review-name')).toHaveText('Test User');
  await expect(page.locator('#review-email')).toHaveText('test.user@example.com');

  // --- State 7: confirm -> thank-you screen ---
  await page.locator('#confirm-step').click();
  await expect(page.getByText('Thank you for booking!')).toBeVisible();

  // --- stop monitoring, write the report for this test ---
  const issues = await evinced.evStop();
  await evinced.evSaveFile(issues, 'html', reportPath);

  console.log('[Test B] continuous scan complete -> ' + reportPath);
  expect(existsSync(reportPath)).toBeTruthy();
});
