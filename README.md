# Evinced Playwright JS SDK - Home Exercise

Runs the Evinced Playwright JS accessibility SDK against the demo store
**https://a11y-audits.com/** and produces an HTML report with screenshots.

| Test | File | Evinced mode | Why |
|------|------|--------------|-----|
| A - simple navigation | `tests/home.navigation.spec.js` | on-demand (`evAnalyze`) | single static page state |
| B - complex flow + validations | `tests/booking.flow.spec.js` | continuous (`evStart`/`evStop`) | scans every state the modal flow passes through |
| Scale example | `tests/catalog.scale-example.spec.js` + `tests/_base.js` | auto-fixture (continuous) | shows Evinced with zero per-test code |

## Prerequisites

- **Node.js 18+** (developed and tested on Node 20 / 24). Check with `node -v`.
- The credentials from the exercise PDF (kept out of git - see below).

## Setup

```bash
# 1. install Node deps (needs the JFrog token in your shell env)
#    PowerShell:  $env:JFROG_AUTH_TOKEN = "<jfrog jwt>"
#    bash/zsh:    export JFROG_AUTH_TOKEN="<jfrog jwt>"
npm install

# 2. install the Playwright browser
npx playwright install chromium

# 3. add the Evinced licensing credentials
cp .env.example .env      # then edit .env: EVINCED_SERVICE_ID + EVINCED_API_KEY
```

## Run

```bash
npm test                  # runs all specs, writes reports
npm run report            # opens the Playwright HTML report
```

Reports are written to `evincedReports/` (gitignored):
- `A-home-navigation.html` - Test A, on-demand scan (17 issues)
- `B-booking-flow.html` - Test B, continuous scan (19 issues)
- `aggregatedReport.html` - both tests merged by the Evinced reporter (24 unique)

A committed snapshot of these lives in [`reports/`](reports/) so the output can be
viewed without a run. Every issue carries severity, a highlighted screenshot,
the failing DOM node, WCAG / Section 508 / EN 301 549 references and a fix.
Last run: 3/3 pass, SDK v2.56.0.

## CI

[`.github/workflows/playwright.yml`](.github/workflows/playwright.yml) runs the
suite and uploads the Evinced and Playwright reports as build artifacts. It is
manual-trigger only until three repo secrets are added (Settings -> Secrets and
variables -> Actions): `JFROG_AUTH_TOKEN`, `EVINCED_SERVICE_ID`,
`EVINCED_API_KEY`; then uncomment the `push` / `pull_request` triggers.

## How the SDK is wired in

- **Auth** - `global.setup.js` runs once before the suite and calls
  `setCredentials({ serviceId, secret })` (online mode).
- **Per-test mode** - `new EvincedSDK(page)`, then `evAnalyze()` for a single
  state (Test A) or `evStart()` / `evStop()` around a flow (Test B).
- **Config** - `evConfig.yaml` turns on per-issue screenshots and report
  aggregation.
- **Reports** - each test calls `evSaveFile(issues, 'html', ...)`; the
  `evincedReporter` in `playwright.config.js` writes the merged report.
- **At scale** - `tests/_base.js` extends Playwright's `test` with an
  `auto: true` fixture, so a spec only needs `require('./_base')` to be scanned.

## Credential hygiene

- `.env` is gitignored - real Evinced credentials never enter git.
- `.npmrc` is committed but contains only `${JFROG_AUTH_TOKEN}`; npm fills it
  from the environment at install time.
- The committed `reports/` snapshot was checked for credential leakage before
  commit (screenshots of a public demo site only).
- Credentials are used for this exercise only.

## Notes on the demo site

`a11y-audits.com` deliberately ships WCAG failures. Two that affected the tests:
- no `<h1>` on the home page -> Test A asserts on `<title>` + the `main` nav landmark.
- the modal's "Next" button is permanently `aria-disabled="true"` but still works
  -> Test B uses `click({ force: true })` and flags it in a comment.

To regenerate selectors after site changes: `npm run codegen`.
