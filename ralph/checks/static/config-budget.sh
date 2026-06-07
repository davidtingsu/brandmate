#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"
source "$(dirname "$0")/../lib/search.sh"

search_q "gpt-4o-mini" lib/config.ts
test -f app/error.tsx
test -f app/global-error.tsx
test -f app/not-found.tsx
search_q '\.env\.local' .gitignore
