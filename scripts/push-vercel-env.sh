#!/usr/bin/env bash
# Push vars from a .env file to Vercel (local use).
# Usage: ./scripts/push-vercel-env.sh [.env.vercel] [production|preview|development]
set -euo pipefail

ENV_FILE="${1:-.env.vercel}"
TARGET="${2:-production}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE — run: cp .env.vercel.example .env.vercel"
  exit 1
fi

if command -v vercel >/dev/null 2>&1; then
  VERCEL_CMD=(vercel)
elif command -v npx >/dev/null 2>&1; then
  VERCEL_CMD=(npx vercel)
else
  echo "Install Vercel CLI: npm i -g vercel  (or use npx vercel)"
  echo "Then: vercel login && vercel link"
  exit 1
fi

VERCEL_ARGS=()
if [[ -n "${VERCEL_TOKEN:-}" ]]; then
  VERCEL_ARGS+=(--token "$VERCEL_TOKEN")
fi

push_var() {
  local key="$1"
  local value="$2"
  echo "Pushing $key → $TARGET"
  "${VERCEL_CMD[@]}" env rm "$key" "$TARGET" -y "${VERCEL_ARGS[@]}" 2>/dev/null || true
  echo -n "$value" | "${VERCEL_CMD[@]}" env add "$key" "$TARGET" "${VERCEL_ARGS[@]}"
}

while IFS= read -r line || [[ -n "$line" ]]; do
  [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
  key="${line%%=*}"
  value="${line#*=}"
  key="$(echo "$key" | xargs)"
  value="$(echo "$value" | sed -e 's/^["'\'']//' -e 's/["'\'']$//')"
  [[ -z "$key" || -z "$value" ]] && continue
  push_var "$key" "$value"
done < "$ENV_FILE"

echo "Done. Redeploy: vercel --prod"
