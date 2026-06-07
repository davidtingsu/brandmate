# REQ-CAROUSEL-IMG: Image carousel PNG export

## REQ-CAROUSEL-IMG-001

Portrait input in GeneratePostForm when carousel selected.

- AC1: Upload portrait control visible for carousel format

## REQ-CAROUSEL-IMG-002

Example portrait bundled at `public/examples/carousel-portrait-example.jpg`.

## REQ-CAROUSEL-IMG-003

Carousel render pipeline and API exist.

- AC1: `lib/pipeline/carousel-render.ts`
- AC2: `app/api/agents/carousel/render/route.ts`

## REQ-CAROUSEL-IMG-004

Per-slide layout in carousel-gen schema.

- AC1: `layout` field in carousel-gen prompt

## REQ-CAROUSEL-IMG-005

`CarouselSlide.imageUrl` populated after render.

## REQ-CAROUSEL-IMG-006

`CarouselRenderProgress` shown during render.

## REQ-CAROUSEL-IMG-007

Preview uses `<img>` when `imageUrl` set.

## REQ-CAROUSEL-IMG-008

Portrait size 1080×1350 in config.

## Verification

- automated: `image-carousel.sh`
- scope: `--scope carousel`
