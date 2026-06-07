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
search_q "Retry with Judge feedback" lib/create-flow/stage-chips.ts
search_q "Regenerate post" lib/create-flow/stage-chips.ts
search_absent_q "Make it less generic" lib/create-flow/stage-chips.ts
search_absent_q "System diagram" lib/create-flow/stage-chips.ts
search_q "retryWithJudgeFeedback" hooks/usePostActions.tsx
search_q "userFeedback" hooks/usePostActions.tsx lib/pipeline/revision-prompt.ts
search_q "hasJudgeFeedback|hasGeneratedPost|getEnabledPostChips" lib/create-flow/stage-chips.ts
search_q "StageSuggestionsList" components/create/
search_q "RenderSuggestionsList" components/create/CreatePostChat.tsx
search_q "dispatchDiagramAgent" hooks/
search_q "CAROUSEL_MODEL" lib/agents/diagram-agent.ts
