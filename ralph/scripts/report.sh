#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
RALPH="$(cd "$(dirname "$0")/.." && pwd)"
SCOPE="all"
FORMAT="markdown"
SKIP_E2E=0
SKIP_MANUAL=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --scope) SCOPE="${2:-all}"; shift 2 ;;
    --format) FORMAT="${2:-markdown}"; shift 2 ;;
    --skip-e2e) SKIP_E2E=1; shift ;;
    --skip-manual) SKIP_MANUAL=1; shift ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

TMP="$(mktemp)"
VERIFY_ARGS=(--scope "$SCOPE")
if [[ "$SKIP_E2E" == "1" ]]; then VERIFY_ARGS+=(--skip-e2e); fi
if [[ "$SKIP_MANUAL" == "1" ]]; then VERIFY_ARGS+=(--skip-manual); fi

set +e
bash "$RALPH/scripts/verify.sh" "${VERIFY_ARGS[@]}" >"$TMP" 2>&1
CODE=$?
set -e

if [[ "$FORMAT" == "json" ]]; then
  node -e "
    const fs = require('fs');
    const out = fs.readFileSync('$TMP', 'utf8');
    const passed = (out.match(/✓/g) || []).length;
    const failed = (out.match(/✗/g) || []).length;
    console.log(JSON.stringify({ scope: '$SCOPE', exitCode: $CODE, passed, failed, output: out }, null, 2));
  "
else
  echo "# Ralph verify report (scope=$SCOPE)"
  echo ""
  echo "Exit code: $CODE"
  echo ""
  echo '```'
  cat "$TMP"
  echo '```'
fi

rm -f "$TMP"
exit "$CODE"
