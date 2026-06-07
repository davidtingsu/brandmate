# BrandMate Ralph Loop Harness

Iterative agent loop with programmatic backpressure for BrandMate product requirements.

Inspired by the [Ralph Wiggum loop](https://ghuntley.com/ralph/).

## Quick start

```bash
# From repo root — full gate (lint, build, static, Playwright, manual checklist)
./ralph/scripts/verify.sh --scope all

# Agent/CI run without manual sign-off
./ralph/scripts/verify.sh --scope all --skip-manual

# Playwright only
npm run test:e2e
./ralph/scripts/verify.sh --scope e2e

# Interactive manual verification
./ralph/scripts/manual-verify.sh

# Dry-run one loop iteration
./ralph/scripts/ralph-loop.sh --max-iterations 1 --agent echo --skip-manual
```

## Layout

| Path | Purpose |
|------|---------|
| `specs/` | REQ-* product requirements with acceptance criteria |
| `checks/` | build, lint, static grep, Playwright E2E |
| `manual-checklist.json` | Manual verification items |
| `scripts/verify.sh` | Run all gates for a scope |
| `scripts/check-manual.sh` | Fail if manual items pending |
| `scripts/manual-verify.sh` | Interactive manual marking |
| `scripts/ralph-loop.sh` | Main iteration loop |
| `IMPLEMENTATION_PLAN.md` | Shared state between iterations |
| `PROMPT.md` | Fixed prompt fed to the agent |

## Scopes

```bash
./ralph/scripts/verify.sh --scope all
./ralph/scripts/verify.sh --scope create
./ralph/scripts/verify.sh --scope profile
./ralph/scripts/verify.sh --scope chips
./ralph/scripts/verify.sh --scope carousel
./ralph/scripts/verify.sh --scope e2e
```

## Flags

| Flag | Effect |
|------|--------|
| `--skip-e2e` | Skip Playwright tests |
| `--skip-manual` | Skip manual checklist gate |

## Adding a requirement

1. Add spec in `specs/` with REQ-ID and testable ACs
2. Add check script in `checks/static/` or E2E test in `checks/e2e/tests/`
3. Register in `checks/manifest.json`
4. Add entry to `IMPLEMENTATION_PLAN.md`

## Completion

Agent outputs `RALPH_COMPLETE` only after `verify.sh --scope all` passes and no manual items are `pending`.
