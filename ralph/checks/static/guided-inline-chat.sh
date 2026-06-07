#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"
source "$(dirname "$0")/../lib/search.sh"

search_q "h-screen" components/create/CreatePostChat.tsx
search_q "GuidedChatMessages" components/create/CreatePostChat.tsx
search_absent_q "GuidedStepPanel" components/create/CreatePostChat.tsx
search_q "brandmate-guided-chat" app/globals.css
search_q "PostActionsProvider" components/create/CreatePostChat.tsx
search_q "usePostActionsContext" components/create/GuidedStepInline.tsx
