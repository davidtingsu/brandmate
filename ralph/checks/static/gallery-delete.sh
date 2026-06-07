#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"
source "$(dirname "$0")/../lib/search.sh"

search_q "stopPropagation" components/posts/PostsGallery.tsx
search_q "setThreads" components/posts/PostsGallery.tsx
search_q "export async function DELETE" app/api/sessions/\[id\]/route.ts
