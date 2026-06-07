You are in a Ralph loop for BrandMate. Read:

1. `ralph/IMPLEMENTATION_PLAN.md` (current task + what's done)
2. `ralph/specs/*.md` (product requirements)
3. `ralph/progress.txt` (prior iterations)

Pick ONE incomplete requirement from IMPLEMENTATION_PLAN.md. Implement it in the codebase. Run `./ralph/scripts/verify.sh --scope all` from the repo root.

Update `ralph/IMPLEMENTATION_PLAN.md` and append a line to `ralph/progress.txt`.

Output `RALPH_COMPLETE` only when:

- `verify.sh --scope all` passes
- Every automated acceptance criterion in specs is satisfied
- Manual ACs are marked verified or N/A in IMPLEMENTATION_PLAN.md

Do not edit `ralph/PROMPT.md` or loop scripts unless the task is harness maintenance.
