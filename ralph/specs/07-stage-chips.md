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

## REQ-CHIPS-006

Post step chips include Retry with Judge feedback and Regenerate post. Absent: Make it less generic, System diagram. Revision actions use `retryWithJudgeFeedback`, `regeneratePost`, and `userFeedback` in orchestrate prompts.

## REQ-CHIPS-007

Post-step chips are gated by `hasGeneratedPost` and `hasJudgeFeedback`. Only enabled chips render; suggestions row hidden when none are enabled. `StageSuggestionsList` drives `RenderSuggestionsList` in create chat.

## UX rules (manual)

- Stepper always visible at top
- Chips send coach messages
- Inline forms remain primary step actions

## Verification

- automated: `stage-chips.sh`
- scope: `--scope chips`
