#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"
source "$(dirname "$0")/../lib/search.sh"

test -f lib/pipeline/diagram-image-gen.ts
test -f public/examples/bytebytego-architecture-reference.png
search_q "description: string" lib/types.ts
search_q "description" lib/agents/diagram-agent.ts
search_absent_q "phases" lib/agents/diagram-agent.ts
search_q "generateDiagramImage" app/api/agents/diagram/route.ts
search_q "images.edit" lib/pipeline/diagram-image-gen.ts
search_q "quality" lib/pipeline/diagram-image-gen.ts
search_q "infer colors" lib/pipeline/diagram-image-gen.ts
search_q "ByteByteGo logo" lib/pipeline/diagram-image-gen.ts
search_q "brandName" lib/pipeline/diagram-image-gen.ts
search_q "brandName" app/api/agents/diagram/route.ts
