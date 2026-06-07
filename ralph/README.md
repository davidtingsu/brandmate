# BrandMate Ralph Loop Harness

Iterative agent loop with programmatic backpressure for BrandMate product requirements.

Inspired by the [Ralph Wiggum loop](https://ghuntley.com/ralph/).

## Quick start

```bash
# From repo root
./ralph/scripts/verify.sh --scope all

# Dry-run one loop iteration
./ralph/scripts/ralph-loop.sh --max-iterations 1 --agent echo

# Manual agent mode (default)
./ralph/scripts/ralph-loop.sh --agent manual
```

## Layout

| Path | Purpose |
|------|---------|
| `specs/` | REQ-* product requirements with acceptance criteria |
| `checks/` | build, lint, static grep checks |
| `scripts/verify.sh` | Run all gates for a scope |
| `scripts/ralph-loop.sh` | Main iteration loop |
| `IMPLEMENTATION_PLAN.md` | Shared state between iterations |
| `PROMPT.md` | Fixed prompt fed to the agent |

## Scopes

```bash
./ralph/scripts/verify.sh --scope all
./ralph/scripts/verify.sh --scope create
./ralph/scripts/verify.sh --scope profile
./ralph/scripts/verify.sh --scope chips
```

## Adding a requirement

1. Add spec in `specs/` with REQ-ID and testable ACs
2. Add check script in `checks/static/` if needed
3. Register in `checks/manifest.json`
4. Add entry to `IMPLEMENTATION_PLAN.md`

## Completion

Agent outputs `RALPH_COMPLETE` only after `verify.sh --scope all` passes.
