#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
RALPH="$(cd "$(dirname "$0")/.." && pwd)"
SCOPE="all"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --scope)
      SCOPE="${2:-all}"
      shift 2
      ;;
    *)
      echo "Unknown arg: $1" >&2
      exit 1
      ;;
  esac
done

MANIFEST="$RALPH/checks/manifest.json"
FAILED=0
PASSED=0

run_check() {
  local name="$1"
  local script="$2"
  echo "→ $name"
  if bash "$script"; then
    PASSED=$((PASSED + 1))
    echo "  ✓ $name"
  else
    FAILED=$((FAILED + 1))
    echo "  ✗ $name" >&2
  fi
}

SCOPE_JSON="$(node -e "
const fs = require('fs');
const m = JSON.parse(fs.readFileSync('$MANIFEST', 'utf8'));
const s = m.scopes['$SCOPE'];
if (!s) { console.error('Unknown scope: $SCOPE'); process.exit(1); }
console.log(JSON.stringify(s));
")"

RUN_LINT="$(node -e "const s=$SCOPE_JSON; console.log(s.lint ? '1' : '0')")"
RUN_BUILD="$(node -e "const s=$SCOPE_JSON; console.log(s.build ? '1' : '0')")"

if [[ "$RUN_LINT" == "1" ]]; then
  run_check "lint" "$RALPH/checks/lint.sh" || true
fi

if [[ "$RUN_BUILD" == "1" ]]; then
  run_check "build" "$RALPH/checks/build.sh" || true
fi

STATIC_SCRIPTS="$(node -e "
const s=$SCOPE_JSON;
(s.static || []).forEach((f) => console.log(f));
")"

while IFS= read -r static_script; do
  [[ -z "$static_script" ]] && continue
  run_check "static/$static_script" "$RALPH/checks/static/$static_script" || true
done <<< "$STATIC_SCRIPTS"

echo ""
echo "Summary: $PASSED passed, $FAILED failed (scope=$SCOPE)"

if [[ "$FAILED" -gt 0 ]]; then
  exit 1
fi
