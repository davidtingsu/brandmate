#!/usr/bin/env bash
set -euo pipefail

RALPH="$(cd "$(dirname "$0")/.." && pwd)"
ROOT="$(cd "$RALPH/.." && pwd)"
STATE_DIR="$RALPH/.ralph-state"
MAX_ITERATIONS=25
AGENT_MODE="manual"
SKIP_E2E=0
SKIP_MANUAL=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --max-iterations) MAX_ITERATIONS="${2:-25}"; shift 2 ;;
    --agent) AGENT_MODE="${2:-manual}"; shift 2 ;;
    --skip-e2e) SKIP_E2E=1; shift ;;
    --skip-manual) SKIP_MANUAL=1; shift ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

mkdir -p "$STATE_DIR"
cd "$ROOT"

VERIFY_ARGS=(--scope all)
if [[ "$SKIP_E2E" == "1" ]]; then
  VERIFY_ARGS+=(--skip-e2e)
fi
if [[ "$SKIP_MANUAL" == "1" ]]; then
  VERIFY_ARGS+=(--skip-manual)
fi

for ((i = 1; i <= MAX_ITERATIONS; i++)); do
  echo "=== Ralph iteration $i / $MAX_ITERATIONS ==="

  bash "$RALPH/scripts/invoke-agent.sh" --mode "$AGENT_MODE"

  if bash "$RALPH/scripts/verify.sh" "${VERIFY_ARGS[@]}"; then
    OUTPUT="$STATE_DIR/last-agent-output.txt"
    if [[ -f "$OUTPUT" ]] && grep -q "RALPH_COMPLETE" "$OUTPUT"; then
      SHA="$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
      echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) | $SHA | iteration $i complete" >>"$RALPH/progress.txt"
      echo "RALPH_COMPLETE — verify passed"
      exit 0
    fi
    echo "Verify passed but RALPH_COMPLETE not found in agent output"
  else
    SHA="$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
    echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) | $SHA | iteration $i verify failed" >>"$RALPH/progress.txt"
    echo "Verify failed — continue loop"
  fi
done

echo "Max iterations ($MAX_ITERATIONS) reached without RALPH_COMPLETE"
exit 1
