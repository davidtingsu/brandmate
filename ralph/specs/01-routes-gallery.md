# REQ-GALLERY: Post gallery

## REQ-GALLERY-001

Home route `/` renders post gallery.

- AC1: `app/page.tsx` exists and builds

## REQ-GALLERY-002

Create Post navigates to `/create` without creating session on mount.

- AC1: Gallery uses `router.push("/create")` only

## REQ-GALLERY-003

Sessions API exists.

- AC1: `app/api/sessions/route.ts` exists

## REQ-GALLERY-004

Gallery cards avoid nested-button hydration.

- AC1: `PostsGallery` uses non-button card click pattern

## REQ-GALLERY-005

Gallery delete removes post without triggering card navigation.

- AC1: Delete button calls `stopPropagation` so card `onClick` does not fire
- AC2: `DELETE /api/sessions/:id` removes thread; UI updates via `setThreads`
- AC3: Delete is instant (no `confirm` dialog)

## REQ-GALLERY-006

Gallery cards show preview image or title + text fallback.

- AC1: `GET /api/sessions` returns `previewImageUrl`, `displayTitle`, `previewText`
- AC2: Cards render cover image when `previewImageUrl` is set

## REQ-GALLERY-007

Post generation produces a single variant (no A/B UI).

- AC1: Prompts request exactly 1 variant
- AC2: `PostCard` has no Variant A/B toggle

## Verification

- automated: `guided-flow.sh`, `gallery-delete.sh`, `gallery-preview.sh`, build
