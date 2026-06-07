# REQ-OVERVIEW: Ralph harness rules

## Completion signal

Agent outputs `RALPH_COMPLETE` only when `./ralph/scripts/verify.sh --scope all` exits 0.

## Harness location

All harness files live under `ralph/` at repo root — not inside `app/`.

## Priority

1. Engineering gates (lint, build)
2. Static product checks
3. Playwright E2E (stubbed APIs)
4. Manual checklist (`manual-checklist.json`; skip with `--skip-manual`)
