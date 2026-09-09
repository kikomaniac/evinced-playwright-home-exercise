// Shared test base for "Evinced at scale".
//
// Any spec that imports { test, expect } from this file automatically gets a
// full continuous accessibility scan - with ZERO Evinced code in the spec.
// The `auto: true` fixture runs before/after every test body.
//
// Per-test JSON results are dropped into evincedReports/tmp/ and the
// evincedReporter (configured in playwright.config.js) + `aggregate: true`
// in evConfig.yaml merge them into one consolidated HTML report.
const base = require('@playwright/test');
const { mkdirSync } = require('node:fs');
const { EvincedSDK } = require('@evinced/js-playwright-sdk');

const test = base.test.extend({
  evincedAuto: [
    async ({ page }, use, testInfo) => {
      const evinced = new EvincedSDK(page);
      await evinced.evStart();

      await use(); // <-- the test body runs here

      const issues = await evinced.evStop();
      const slug = testInfo.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
      mkdirSync('./evincedReports/tmp', { recursive: true });
      const out = `./evincedReports/tmp/${slug}.json`;
      await evinced.evSaveFile(issues, 'json', out);
      await testInfo.attach('evinced-a11y', { path: out, contentType: 'application/json' });
    },
    { auto: true },
  ],
});

const expect = base.expect;
module.exports = { test, expect };
