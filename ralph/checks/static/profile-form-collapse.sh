#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"
source "$(dirname "$0")/../lib/search.sh"

search_q "if \(saved\)" components/forms/ProfileForm.tsx
search_q "BrandProfileCard" components/forms/ProfileForm.tsx
search_q "BrandProfileCard" components/create/GuidedStepInline.tsx
search_q 'stage === "post"' components/create/GuidedStepInline.tsx
