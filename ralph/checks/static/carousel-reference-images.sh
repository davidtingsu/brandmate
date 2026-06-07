#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"
source "$(dirname "$0")/../lib/search.sh"

test -f lib/pipeline/carousel-slide-image-gen.ts
search_q "getCarouselReferenceIndex" lib/pipeline/carousel-slide-image-gen.ts
search_q "images.edit" lib/pipeline/carousel-slide-image-gen.ts
search_q "carousel-ref-" lib/pipeline/carousel-slide-image-gen.ts
search_q "1024x1536" lib/pipeline/carousel-slide-image-gen.ts
search_q "generateCarouselSlideImage" lib/carousel/render-slide.ts
search_q "RENDER_CONCURRENCY" lib/pipeline/carousel-render.ts
search_q "CAROUSEL_IMAGE_MODEL" lib/pipeline/carousel-slide-image-gen.ts
search_q "input_fidelity" lib/pipeline/carousel-slide-image-gen.ts
search_q "Place the person from Image 2" lib/pipeline/carousel-slide-image-gen.ts
search_q "gpt-image-2" lib/config.ts

for i in 01 02 03 04 05 06 07; do
  test -f "public/examples/carousel-refs/carousel-ref-${i}.png"
done
