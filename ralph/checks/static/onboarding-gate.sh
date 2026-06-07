#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"
source "$(dirname "$0")/../lib/search.sh"

test -f middleware.ts
test -f app/onboard/page.tsx
test -f lib/brand-profile-storage.ts
search_q "STUDIO_STAGE_ORDER" lib/create-flow/stages.ts
search_q "onboard-page" components/onboard/
search_q "seedOnboardedState" ralph/checks/e2e/fixtures/stubs.ts
