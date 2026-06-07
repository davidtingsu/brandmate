# REQ-CHIPS: Stage chips UI

## REQ-CHIPS-001

Stage chip config in `lib/create-flow/stage-chips.ts` for brand, post, preview.

## REQ-CHIPS-002

Brand step: chips-only input (`ChipsOnlyInput`), no textarea.

## REQ-CHIPS-003

Preview step: chips-only input.

## REQ-CHIPS-004

Post step: default CopilotKit text input retained.

## REQ-CHIPS-005

`CopilotChat` passes stage-specific `suggestions` from chip config.

## UX rules (manual)

- Stepper always visible at top
- Chips send coach messages
- Inline forms remain primary step actions

## Verification

- automated: `stage-chips.sh`
- scope: `--scope chips`
