#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"
source "$(dirname "$0")/../lib/search.sh"

test -f ralph/checks/e2e/playwright.config.ts
test -f ralph/checks/e2e.sh
test -f ralph/manual-checklist.json
test -f ralph/scripts/check-manual.sh
test -f ralph/scripts/manual-verify.sh
search_q "test:e2e" package.json
search_q "installApiStubs" ralph/checks/e2e/
