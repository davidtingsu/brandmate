#!/usr/bin/env bash
# Sync environment variables to Vercel from the current shell environment.
# Used by GitHub Actions — secrets are injected as env vars by the workflow.
# Usage: VERCEL_TOKEN=... ./scripts/push-vercel-env-ci.sh [production|preview]
set -euo pipefail

TARGET="${1:-production}"

if [[ -z "${VERCEL_TOKEN:-}" ]]; then
  echo "VERCEL_TOKEN is required"
  exit 1
fi

VERCEL_ARGS=(--token "$VERCEL_TOKEN")
if [[ -n "${VERCEL_SCOPE:-}" ]]; then
  VERCEL_ARGS+=(--scope "$VERCEL_SCOPE")
fi

push_var() {
  local key="$1"
  local value="$2"
  echo "Syncing $key → Vercel ($TARGET)"
  vercel env rm "$key" "$TARGET" -y "${VERCEL_ARGS[@]}" 2>/dev/null || true
  echo -n "$value" | vercel env add "$key" "$TARGET" "${VERCEL_ARGS[@]}"
}

# Keys synced from GitHub Secrets → job env → this script
SYNC_KEYS=(
  OPENAI_API_KEY
  REDIS_URL
  WANDB_API_KEY
  WEAVE_PROJECT
  OPENAI_MODEL
  OPENAI_EMBEDDING_MODEL
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  SUPABASE_SECRET_KEY
  SUPABASE_STORAGE_BUCKET
  OPENAI_IMAGE_MODEL
)

for key in "${SYNC_KEYS[@]}"; do
  value="${!key:-}"
  if [[ -n "$value" ]]; then
    push_var "$key" "$value"
  else
    echo "Skipping $key (not set in CI environment)"
  fi
done

echo "Vercel env sync complete."
