# Contact List — Test Automation Framework

UI + API test automation for the [Thinking Tester Contact List app](https://thinking-tester-contact-list.herokuapp.com/):

- **E2E tests** drive the browser through Page/Component Objects.
- **API tests** call the REST API through typed clients and validate responses against [zod](https://zod.dev) schemas.

**Stack:** TypeScript · Playwright Test · zod · winston · Docker · GitHub Actions.

## Prerequisites & setup

- Node.js **20+** (see `engines` in `package.json`)
- `npm ci`
- `npx playwright install` (or `npx playwright install chromium` for the browsers actually used)
- Copy `.env.example` to `.env` and adjust if needed. Every variable is validated at startup by `src/config/env.ts` — invalid values abort the run immediately.

| Variable | Default | Purpose |
| --- | --- | --- |
| `BASE_URL` | herokuapp URL | Application under test (UI + API share it) |
| `ENV` | `local` | Environment label: `local` \| `ci` \| `staging` |
| `LOG_LEVEL` | `info` | winston level; set `debug` to log request/response bodies |
| `HEADED` | `false` | Show the browser during local e2e runs; ignored on CI |

## Running tests

```bash
npm test                                  # everything (setup → e2e + api)
npm run test:e2e                          # UI tests only
npm run test:api                          # API tests only
npx playwright test tests/e2e/contacts.spec.ts   # single spec
npm run test:headed                       # headed browser
npm run test:debug                        # Playwright inspector
npm run report                            # open the HTML report (npx playwright show-report)
```

In Docker:

```bash
docker compose run --rm tests
```

Reports, traces and logs land in `blob-report/`, `test-results/` and `logs/` on the host via volume mounts.

The container runs with `CI=1`, so it produces a **blob report** (`blob-report/report.zip`) rather than an HTML one — `npx playwright show-report` straight after a Docker run would 404. Convert it first:

```bash
npx playwright merge-reports --reporter html ./blob-report   # → playwright-report/
npm run report                                               # open it
```

## Project structure

```
src/
  pages/        # Page Objects — locators + actions only, no assertions
  components/   # Reusable UI fragments (Header, …) shared across pages
  api/          # Typed API clients wrapping APIRequestContext + zod schemas
  fixtures/     # Custom Playwright fixtures injecting POMs & API clients
  data/         # Test data builders — unique data per call (parallel-safe)
  utils/        # Pure helpers: logger.ts (winston), envHelper.ts
  config/       # Typed env config — fails fast on invalid/missing vars
tests/
  e2e/          # UI journeys (arrange via API, act/assert via UI)
  api/          # API contract tests (status + zod schema validation)
  setup/        # Auth setup project → storageState per role in .auth/
playwright.config.ts
```

## Design choices

- **POM without assertions** — page objects expose locators and actions; expectations live in tests. Assertions in POMs hide intent, duplicate checks, and make failures harder to read.
- **Fixtures over BaseTest hooks** — Playwright fixtures compose, are lazily instantiated, type-checked, and scoped (test vs worker). Inheritance-based base tests grow into god-objects with implicit ordering.
- **storageState auth per role** — login happens once per role in a `setup` project (via API, no UI login tax); browser projects reuse the saved state via project `dependencies`. Tests start authenticated, fast, and independent.
- **Semantic selectors only** (`getByRole` > `getByLabel` > `getByTestId`) — they test what users perceive, survive markup refactors, and double as an accessibility check. No CSS/XPath.
- **zod schema validation** — API tests assert the response *contract*, not just the status code; schemas double as the single source of TypeScript types (`z.infer`).
- **Env-driven config** — one typed `env` object, validated at startup. No `process.env` scattered through the code, no "undefined baseURL" surprises mid-run.
- **winston with child loggers over console.log** — leveled, structured logs with a `scope` per layer (`AuthSetup`, `ContactsClient`, POM names) go to a colorized console and a JSON file (`logs/test-run.log`). `LOG_LEVEL=debug` reveals request/response bodies with `password`/`token` fields redacted — credentials and tokens are never logged at any level.

## CI

`.github/workflows/playwright.yml` runs on pushes/PRs to `main`:

1. **api** — runs the API tests first (no browser install needed), acting as a fast smoke gate; uploads its blob report, `test-results/` and `logs/` as artifacts with `if: always()`.
2. **e2e** — runs the UI tests (Chromium) only after the api job passes (`needs: api`); uploads the same artifact set. If the API gate fails, e2e is skipped.
3. **merge-report** — downloads the blob reports from both jobs and runs `npx playwright merge-reports --reporter html` to produce one combined HTML report, uploaded as the `playwright-report` artifact (`if: always()`, so a report is produced even when e2e was skipped).

PR runs also get inline annotations via the `github` reporter. Failure artifacts (trace on first retry, screenshot on failure, video on failure) are attached to the HTML report on CI only.

## Conventions

- **Naming:** `PascalCase` classes (`ContactListPage`, `ContactsClient`), `camelCase` methods (`seedContact`), brief JSDoc on each class and public method.
- **Selectors:** `getByRole` first, then `getByLabel`, then `getByTestId`. Never CSS/XPath, never raw locators in test files — add them to a POM/component.
- **Assertions:** web-first only (`await expect(locator).toBeVisible()`); no hard waits (`waitForTimeout`).
- **Test data:** always via builders in `src/data/` so every test gets unique data and stays parallel-safe. Arrange state through API clients, act/assert through the UI.
- **Logging:** import `logger` from `src/utils/logger.ts` and derive a child (`logger.child({ scope: 'MyPage' })`). No `console.log`. Log high-level actions at `info`, payloads at `debug`, never credentials/tokens.
- **Adding a page:** extend `BasePage`, declare locators as `readonly` fields, add action methods, expose it via `src/fixtures/test.ts`. 
- **Adding a test:** import `test`/`expect` from the fixtures file, never from `@playwright/test` directly.
