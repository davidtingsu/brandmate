# REQ-CREATE-013: Immediate generation loading UX

## REQ-CREATE-013

Post generation shows immediate loading preview on Generate click: `PostGeneratingPreview`, time-based `CircularProgressRing`, and `~Xs remaining` countdown.

## Estimates

- Text: ~45s
- Post with image / diagram: 120s
- Carousel: 180s

## Rules

- No `CarouselRenderProgress` slide counter in create flow
- Judge breakdown hidden until `isAttemptMediaComplete`
- Image placeholders use static background + ring (no pulse)

## Verification

- automated: `generation-loading.sh`
- scope: `--scope create`
