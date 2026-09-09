Subject: Home exercise - Evinced Playwright JS SDK on a11y-audits.com

Hi team,

I completed the exercise. Summary below; the test project is at:
https://github.com/kikomaniac/evinced-playwright-home-exercise and the HTML report is attached.

What I did
- Set up a Playwright (JS) project targeting https://a11y-audits.com/.
- Pulled @evinced/js-playwright-sdk from the JFrog registry via a scoped .npmrc.
- Authorized the SDK once in global.setup.js using setCredentials() (online mode,
  Service ID + API key).
- Wrote two tests, each using the mode that fits it:
  - Test A - simple navigation to the home page. On-demand scan (evAnalyze),
    since it is a single static state.
  - Test B - the multi-step "book a consultation" modal flow (7 states, from the
    home page to the confirmation screen), with Playwright assertions on the
    validations: empty step 1 is blocked with all three required-field messages,
    a badly formatted email / phone is also blocked, step 2's "Next" stays
    disabled until a date and time are picked, and the review screen echoes the
    values entered. Continuous mode (evStart/evStop) so every DOM state in the
    flow is analyzed automatically.
- Enabled screenshots in evConfig.yaml and produced an aggregated HTML report
  via the Evinced Playwright reporter (SDK v2.56.0). The consolidated report
  flags 24 issues across the two tests, each with a highlighted screenshot,
  WCAG / Section 508 / EN 301 549 references and a "how to fix".

Scaling to all tests
- Added tests/_base.js: a Playwright fixture (auto: true) that wraps every test
  in evStart/evStop and writes per-test results. Specs just import { test } from
  it and get accessibility coverage with no SDK code of their own - see
  tests/catalog.scale-example.spec.js.
- Other options I'd consider depending on the team: a declarative per-file mode
  option (test.use({ evMode: 'ondemand' })), a dedicated Playwright project, or
  driving it purely from the Evinced reporter.
- Added a GitHub Actions workflow (.github/workflows/playwright.yml) that runs
  the suite and uploads the aggregated HTML report as a build artifact; it can
  also gate the build on new critical issues, or push results to the Evinced
  Platform for trend tracking.

Issues encountered / how I resolved them
- JFrog auth: `npm install` returned 401 until I set the JFROG_AUTH_TOKEN
  environment variable (the .npmrc references it as ${JFROG_AUTH_TOKEN} rather
  than hard-coding the token).
- Package name: the docs landing page and some examples refer to it differently;
  the actual published package is @evinced/js-playwright-sdk - set that in
  package.json.
- The demo site has no top-level heading (`<h1>`) on the home page - itself a
  WCAG issue - so my first Test A assertion (expecting an `<h1>`) failed.
  Switched to asserting on the page title and the "main" navigation landmark.
- In the booking modal, the "Next" button (#next-to-step-2) is permanently
  aria-disabled="true" but still functional. Playwright refused to click it;
  used click({ force: true }) and noted it in a comment - this is one of the
  site's intentional accessibility defects.
- The date/time radios in step 2 are visually-hidden (sr-only); clicked their
  label elements instead of the inputs.
- The docs page shows `npm install @evinced/js-playwright-sdk` directly, but the
  package is served from the private JFrog registry - the scoped .npmrc is what
  makes it resolve.

Results
- Test A (home, on-demand): 17 issues.
- Test B (booking flow, continuous): 19 issues - including modal-only findings
  that a single static scan would miss (e.g. the step-1 email field has no
  accessible name; a date-picker label fails colour contrast).
- Aggregated report: 24 unique issues. A copy is committed under reports/ in the
  repo and attached to this email.

Credentials were kept out of the repo (.env gitignored, .npmrc uses an env-var
placeholder) and used only for this exercise.

Happy to walk through the report and the code.

Thanks,
Kiko
