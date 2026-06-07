#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"
source "$(dirname "$0")/../lib/search.sh"

search_q "PostGeneratingPreview" components/create/
search_q "GENERATION_ESTIMATE_MS" lib/generation-estimates.ts
search_q "CircularProgressRing" components/
search_q "generationPreview" hooks/usePostActions.tsx components/create/GuidedStepInline.tsx
search_q "isAttemptMediaComplete" lib/attempt-media-complete.ts hooks/usePostActions.tsx
search_q "formatTimeRemaining" lib/generation-estimates.ts
search_absent_q "CarouselRenderProgress" components/create/GuidedStepInline.tsx
