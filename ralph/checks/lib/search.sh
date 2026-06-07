#!/usr/bin/env bash
# search.sh PATTERN FILE...
# Quiet match; exits 0 if any path contains PATTERN.
search_q() {
  local pattern="$1"
  shift
  if command -v rg >/dev/null 2>&1; then
    rg -q "$pattern" "$@"
  else
    grep -rqE "$pattern" "$@"
  fi
}

search_absent_q() {
  local pattern="$1"
  shift
  if command -v rg >/dev/null 2>&1; then
    ! rg -q "$pattern" "$@"
  else
    ! grep -rqE "$pattern" "$@"
  fi
}
