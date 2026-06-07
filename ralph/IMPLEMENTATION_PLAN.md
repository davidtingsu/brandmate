# BrandMate Implementation Plan (Ralph shared state)

## Done

- REQ-ENG-001/002 — lint and build gates
- REQ-GALLERY-001 through REQ-GALLERY-004
- REQ-CREATE-001 through REQ-CREATE-012
- REQ-INLINE-001 through REQ-INLINE-005
- REQ-PREVIEW-001 through REQ-PREVIEW-003
- REQ-AGENT-001 through REQ-AGENT-005
- REQ-CREATE-010 — ProfileForm collapses to BrandProfileCard after save
- REQ-CREATE-011 — BrandProfileCard above GeneratePostForm on Step 2
- REQ-CHIPS-001 through REQ-CHIPS-005 — stage chips + chips-only input
- REQ-CAROUSEL-IMG-001 through REQ-CAROUSEL-IMG-009 — image carousel PNG render, portrait input, progress UI, premium CAROUSEL_MODEL
- REQ-E2E-001 through REQ-E2E-003 — Playwright E2E in verify pipeline (stubbed carousel APIs)
- REQ-MANUAL-001 through REQ-MANUAL-004 — manual checklist + skip-manual + manual-verify.sh

## Backlog

- Supabase profile image onError fallback
- CI job running `verify.sh --skip-manual` on pull requests

## Manual verification

See [`manual-checklist.json`](manual-checklist.json). All items default to `n/a`. Set status to `pending` when human sign-off is required before `RALPH_COMPLETE`.

Run `./ralph/scripts/manual-verify.sh` or `./ralph/scripts/verify.sh --skip-manual` for agent-only loops.
