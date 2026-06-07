#!/usr/bin/env bash
set -euo pipefail

RALPH="$(cd "$(dirname "$0")/.." && pwd)"
ROOT="$(cd "$RALPH/.." && pwd)"
CHECKLIST="$RALPH/manual-checklist.json"
STATE_DIR="$RALPH/.ralph-state"
STATE_FILE="$STATE_DIR/manual-verification.json"

mkdir -p "$STATE_DIR"

if [[ ! -f "$CHECKLIST" ]]; then
  echo "Missing $CHECKLIST" >&2
  exit 1
fi

node -e "
const fs = require('fs');
const readline = require('readline');

const checklistPath = '$CHECKLIST';
const statePath = '$STATE_FILE';
const data = JSON.parse(fs.readFileSync(checklistPath, 'utf8'));
const pending = (data.items || []).filter((i) => i.status === 'pending');

if (pending.length === 0) {
  console.log('No pending manual verification items.');
  process.exit(0);
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, res));

(async () => {
  const log = [];
  for (const item of pending) {
    console.log('');
    console.log('[' + item.id + '] ' + item.title);
    console.log(item.steps);
    const answer = (await ask('Mark as (v)erified / (s)kip / (n/a): ')).trim().toLowerCase();
    let status = 'pending';
    if (answer === 'v' || answer === 'verified') status = 'verified';
    else if (answer === 's' || answer === 'skip' || answer === 'skipped') status = 'skipped';
    else if (answer === 'n' || answer === 'n/a' || answer === 'na') status = 'n/a';
    else {
      console.log('Invalid input, leaving as pending.');
      continue;
    }
    item.status = status;
    log.push({ id: item.id, status, at: new Date().toISOString() });
  }
  rl.close();
  fs.writeFileSync(checklistPath, JSON.stringify(data, null, 2) + '\n');
  const prev = fs.existsSync(statePath)
    ? JSON.parse(fs.readFileSync(statePath, 'utf8'))
    : { history: [] };
  prev.history = [...(prev.history || []), ...log];
  prev.updatedAt = new Date().toISOString();
  fs.writeFileSync(statePath, JSON.stringify(prev, null, 2) + '\n');
  console.log('');
  console.log('Updated manual-checklist.json');
})();
"

cd "$ROOT"
bash "$RALPH/scripts/check-manual.sh"
