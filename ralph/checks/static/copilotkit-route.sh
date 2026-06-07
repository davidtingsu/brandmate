#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"
source "$(dirname "$0")/../lib/search.sh"

search_q 'mode: "multi-route"' app/api/copilotkit/
search_q "useSingleEndpoint={false}" components/create/CreatePostChat.tsx
search_absent_q "diagram_explainer: new BuiltInAgent" app/api/copilotkit/
test -f app/api/agents/orchestrate/route.ts
test -f app/api/agents/memory/route.ts
test -f app/api/memory/store/route.ts
test -f lib/redis/lesson-store.ts
test -f lib/weave/ops.ts
test -f instrumentation.ts
