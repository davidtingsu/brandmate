#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"
source "$(dirname "$0")/../lib/search.sh"

search_q "CreateFlowStepper" components/create/CreatePostChat.tsx
search_q "STAGE_ORDER" lib/create-flow/stages.ts
search_q "GuidedStepInline" components/create/GuidedChatMessages.tsx
search_q "showPreviewCta: false" components/create/GuidedStepInline.tsx
search_q "advanceToPreview" components/create/GuidedStepInline.tsx
search_q "hasApprovedPost" components/create/CreatePostChat.tsx lib/sessions/approved-post.ts
search_q "ensureSession" hooks/useSessionLoader.ts components/create/CreatePostChat.tsx
search_absent_q "useDiagramAgent" components/create/CreatePostChat.tsx
search_q "createFlowStage|useCopilotReadable" hooks/useGenerativeUI.tsx
search_q 'router\.push\("/create"\)' components/gallery/GalleryHome.tsx
test -f app/api/sessions/route.ts
search_q "findApprovedPost" lib/sessions/approved-post.ts app/preview/
