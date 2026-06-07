#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"
source "$(dirname "$0")/../lib/search.sh"

search_q "portraitImageUrl" components/forms/GeneratePostForm.tsx
search_q "portraitImageUrl" app/api/agents/orchestrate/route.ts
test -f public/examples/carousel-portrait-example.jpg
test -f lib/pipeline/carousel-render.ts
test -f app/api/agents/carousel/render/route.ts
test -f lib/carousel/render-slide.ts
search_q '"layout"' lib/pipeline/carousel-gen.ts
search_q "CarouselRenderProgress" components/create/
search_q "imageUrl" components/linkedin/LinkedInSlideCard.tsx
search_q "CAROUSEL_PORTRAIT_SIZE" lib/config.ts
search_q "CAROUSEL_MODEL" lib/config.ts
search_q "gpt-5.5" lib/config.ts
search_q "CAROUSEL_MODEL" lib/pipeline/carousel-gen.ts
search_q "Download slides" components/generative/PostCard.tsx
