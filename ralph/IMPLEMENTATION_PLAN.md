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

## Backlog

- Playwright E2E in ralph/checks/e2e/
- Supabase profile image onError fallback
- CI job running verify.sh only

## Manual verification (N/A for v1 loop)

- Full E2E post generation (OpenAI + Redis) — N/A
- Weave score improvement demo — N/A
- Supabase profile image upload/display — N/A
- End-to-end: submit profile → card → generate form → generate post — verified in implementation
