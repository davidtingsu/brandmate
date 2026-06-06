#!/usr/bin/env bash
# Commit with fixed author identity (no git config changes).
# Usage:
#   ./scripts/git-commit.sh -m "message"
#   ./scripts/git-commit.sh -a -m "message"
#   ./scripts/git-commit.sh "message"
#   ./scripts/git-commit.sh <<'EOF'
#   multi-line message
#   EOF
set -euo pipefail

export GIT_AUTHOR_NAME="David Su"
export GIT_AUTHOR_EMAIL="dtscraft@gmail.com"
export GIT_COMMITTER_NAME="David Su"
export GIT_COMMITTER_EMAIL="dtscraft@gmail.com"

if [[ $# -eq 0 ]]; then
  if [[ ! -t 0 ]]; then
    git commit -F -
  else
    echo "Usage: $0 [-a] [-m \"message\"] | $0 <<'EOF' ... EOF"
    exit 1
  fi
elif [[ "$1" == -* ]]; then
  git commit "$@"
else
  git commit -m "$*"
fi

echo "Committed as ${GIT_AUTHOR_NAME} <${GIT_AUTHOR_EMAIL}>"
