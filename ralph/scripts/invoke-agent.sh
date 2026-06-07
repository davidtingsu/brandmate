#!/usr/bin/env bash
set -euo pipefail

RALPH="$(cd "$(dirname "$0")/.." && pwd)"
STATE_DIR="$RALPH/.ralph-state"
MODE="manual"
PROMPT_FILE="$RALPH/PROMPT.md"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --mode) MODE="${2:-manual}"; shift 2 ;;
    --prompt) PROMPT_FILE="${2:-$PROMPT_FILE}"; shift 2 ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

mkdir -p "$STATE_DIR"
OUTPUT="$STATE_DIR/last-agent-output.txt"

case "$MODE" in
  manual)
    echo "=== Ralph manual agent mode ==="
    echo ""
    echo "1. Open Cursor Agent in this repo"
    echo "2. Paste the contents of: $PROMPT_FILE"
    echo "3. Save agent output to: $OUTPUT"
    echo ""
    cat "$PROMPT_FILE"
    if [[ -f "$OUTPUT" ]]; then
      echo ""
      echo "--- existing $OUTPUT ---"
      cat "$OUTPUT"
    fi
    ;;
  echo)
    echo "RALPH_ECHO: harness dry-run — no code changes"
    echo "RALPH_COMPLETE" >"$OUTPUT"
    cat "$OUTPUT"
    ;;
  cursor)
    echo "cursor mode is a stub — use manual or echo" >&2
    exit 2
    ;;
  *)
    echo "Unknown mode: $MODE" >&2
    exit 1
    ;;
esac
