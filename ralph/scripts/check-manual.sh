#!/usr/bin/env bash
set -euo pipefail

RALPH="$(cd "$(dirname "$0")/.." && pwd)"
CHECKLIST="$RALPH/manual-checklist.json"
SKIP_MANUAL=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --skip-manual) SKIP_MANUAL=1; shift ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

if [[ "$SKIP_MANUAL" == "1" ]]; then
  echo "→ manual verification (skipped)"
  exit 0
fi

if [[ ! -f "$CHECKLIST" ]]; then
  echo "Missing $CHECKLIST" >&2
  exit 1
fi

PENDING="$(node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('$CHECKLIST', 'utf8'));
const pending = (data.items || []).filter((i) => i.status === 'pending');
if (pending.length) {
  pending.forEach((p) => console.log(p.id + ': ' + p.title));
  process.exit(1);
}
")"

if [[ $? -ne 0 ]]; then
  echo "→ manual verification"
  echo "  ✗ pending manual items:" >&2
  echo "$PENDING" >&2
  echo "  Run: ./ralph/scripts/manual-verify.sh  or  verify.sh --skip-manual" >&2
  exit 1
fi

echo "→ manual verification"
echo "  ✓ no pending manual items"
