# REQ-MANUAL: Manual verification checklist

## REQ-MANUAL-001

Manual checklist exists at `ralph/manual-checklist.json`.

- AC1: Each item has `id`, `title`, `steps`, `status`
- AC2: Status is one of `pending`, `verified`, `skipped`, `n/a`

## REQ-MANUAL-002

`check-manual.sh` fails when any item is `pending`.

## REQ-MANUAL-003

`verify.sh --skip-manual` bypasses manual gate.

## REQ-MANUAL-004

`manual-verify.sh` interactively updates checklist statuses.

## Verification

- automated: `e2e-harness.sh`, `check-manual.sh`
- interactive: `./ralph/scripts/manual-verify.sh`
