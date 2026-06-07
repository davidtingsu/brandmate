#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"
source "$(dirname "$0")/../lib/search.sh"

test -f lib/sessions/gallery-preview.ts
search_q "buildThreadGalleryPreview" lib/sessions/gallery-preview.ts
search_q "listLatestAttemptsForThreads" lib/sessions/store.ts
search_q "buildThreadGalleryPreview" app/api/sessions/route.ts
search_absent_q 'confirm\(' components/posts/PostsGallery.tsx
search_q "previewImageUrl" components/posts/PostsGallery.tsx
search_q "exactly 1 variant" lib/pipeline/post-loop.ts
search_q "Exactly 1 variant" lib/pipeline/carousel-gen.ts
search_absent_q "Variant A" components/generative/PostCard.tsx
