# REQ-CAROUSEL-REF: Carousel reference image generation

## REQ-CAROUSEL-REF-001

Seven numbered carousel reference PNGs bundled at `public/examples/carousel-refs/carousel-ref-01.png` through `carousel-ref-07.png`.

## REQ-CAROUSEL-REF-002

Per-slide image generation uses `images.edit` with the mapped reference PNG.

- AC1: `lib/pipeline/carousel-slide-image-gen.ts` calls `images.edit`
- AC2: Portrait size `1024x1536`

## REQ-CAROUSEL-REF-003

Slide index maps to reference image via `getCarouselReferenceIndex`.

- AC1: First slide → ref 01
- AC2: Last slide → ref 07
- AC3: Middle slides cycle refs 02–06

## REQ-CAROUSEL-REF-004

User portrait passed as second image on cover/CTA and portrait layouts.

- AC1: `shouldIncludePortrait` checks ref 01, ref 07, and `portrait_*` layouts

## REQ-CAROUSEL-REF-005

Sharp+SVG compositor replaced; `render-slide.ts` delegates to `generateCarouselSlideImage`.

## REQ-CAROUSEL-REF-006

Carousel render limits concurrent `images.edit` calls (default 3).

## REQ-CAROUSEL-REF-007

Uploaded portrait likeness preserved via OpenAI cookbook compositing.

- AC1: Carousel slides use `gpt-image-2` (`CAROUSEL_IMAGE_MODEL` / `IMAGE_MODEL`)
- AC2: Portrait slides pass reference as Image 1, portrait as Image 2
- AC3: `input_fidelity: "high"` and `quality: "high"` on portrait compositing edits
- AC4: Prompt uses cookbook transplant pattern (`Place the person from Image 2 into Image 1`)

## Verification

- automated: `carousel-reference-images.sh`, `image-carousel.sh`
- scope: `--scope carousel`
