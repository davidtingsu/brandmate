You are in a Ralph loop for BrandMate. Read:

1. `ralph/IMPLEMENTATION_PLAN.md` (current task + what's done)
2. `ralph/specs/*.md` (product requirements)
3. `ralph/progress.txt` (prior iterations)

Pick ONE incomplete requirement from IMPLEMENTATION_PLAN.md. Implement it in the codebase. Run `./ralph/scripts/verify.sh --scope all` from the repo root (includes lint, build, static checks, Playwright E2E, and manual checklist).

Update `ralph/IMPLEMENTATION_PLAN.md` and append a line to `ralph/progress.txt`.

Manual verification:
- Items live in `ralph/manual-checklist.json`
- Run `./ralph/scripts/manual-verify.sh` to mark items verified/skipped/n/a
- Or use `./ralph/scripts/verify.sh --skip-manual` for agent-only / CI runs

Output `RALPH_COMPLETE` only when:

- `verify.sh --scope all` passes (use `--skip-manual` only when manual ACs are N/A)
- Every automated acceptance criterion in specs is satisfied
- No manual checklist items remain `pending`

Do not edit `ralph/PROMPT.md` or loop scripts unless the task is harness maintenance.
