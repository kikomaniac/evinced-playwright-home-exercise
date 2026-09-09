// @ts-check
const { defineConfig, devices } = require('@playwright/test');
require('dotenv').config();

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    // Aggregates every test's Evinced results into one consolidated report.
    ['./node_modules/@evinced/js-playwright-sdk/dist/reporter/evincedReporter.js'],
  ],
  globalSetup: require.resolve('./global.setup.js'),
  use: {
    baseURL: 'https://a11y-audits.com',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'off',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
