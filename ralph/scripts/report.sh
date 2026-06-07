#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
RALPH="$(cd "$(dirname "$0")/.." && pwd)"
SCOPE="all"
FORMAT="markdown"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --scope) SCOPE="${2:-all}"; shift 2 ;;
    --format) FORMAT="${2:-markdown}"; shift 2 ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

TMP="$(mktemp)"
set +e
bash "$RALPH/scripts/verify.sh" --scope "$SCOPE" >"$TMP" 2>&1
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
