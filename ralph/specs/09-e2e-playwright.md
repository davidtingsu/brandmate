# REQ-E2E: Playwright browser tests

## REQ-E2E-001

Playwright runs as part of `verify.sh --scope all`.

- AC1: `ralph/checks/e2e/playwright.config.ts` exists
- AC2: `npm run test:e2e` runs gallery, create-flow, carousel-flow specs

## REQ-E2E-002

Carousel APIs are stubbed in E2E (no live OpenAI).

- AC1: `fixtures/stubs.ts` intercepts orchestrate and carousel/render

## REQ-E2E-003

`verify.sh --skip-e2e` bypasses Playwright gate.

## Verification

- automated: `e2e.sh`, `e2e-harness.sh`
- scope: `--scope e2e`
