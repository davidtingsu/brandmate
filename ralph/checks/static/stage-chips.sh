#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"
source "$(dirname "$0")/../lib/search.sh"

test -f lib/create-flow/stage-chips.ts
search_q "ChipsOnlyInput" components/create/
search_q "CreateFlowStepper" components/create/CreatePostChat.tsx
search_q "suggestions" components/create/CreatePostChat.tsx
search_q "STAGE_CHIPS|stage-chips|getStageChips" lib/create-flow/ components/create/
search_q 'stage === "preview"' components/create/CreatePostChat.tsx
