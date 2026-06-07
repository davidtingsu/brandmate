# REQ-CREATE: Guided 3-step create chat

## REQ-CREATE-001

Stepper shows Create post → Preview (brand onboarding moved to `/onboard`).

- AC1: `CreateFlowStepper` + `STUDIO_STAGE_ORDER` in `lib/create-flow/stages.ts`

## REQ-CREATE-002

Forms inline in chat via `GuidedChatMessages` + `GuidedStepInline`.

- AC1: `GuidedStepInline` imported in `GuidedChatMessages`

## REQ-CREATE-003

Full-height chat; text input on post step only; preview uses chips-only footer.

- AC1: `ChipsOnlyInput` wired for preview
- AC2: Default input on post step

## REQ-CREATE-012

`CreateFlowStepper` visible above chat on all steps.

- AC1: `CreateFlowStepper` in `CreatePostChat.tsx`

## REQ-CREATE-004

`ApprovePostCard` not shown in step 2.

- AC1: `showPreviewCta: false` in step 2 render path

## REQ-CREATE-005

Continue to preview advances stage only.

- AC1: `advanceToPreview()` in `GuidedStepInline`

## REQ-CREATE-006

Resume behavior.

- AC1: `hasApprovedPost` redirects to preview route

## REQ-CREATE-007

Lazy session creation.

- AC1: `ensureSession()` not called on bare `/create` mount

## REQ-CREATE-008

No diagram agent in create flow.

- AC1: No `useDiagramAgent` in `CreatePostChat`

## REQ-CREATE-009

Stage exposed to coach.

- AC1: `useCopilotReadable` for stage in `useGenerativeUI`

## REQ-INLINE-001 through REQ-INLINE-005

See guided inline layout checks in `guided-inline-chat.sh`.

## Verification

- automated: `guided-flow.sh`, `guided-inline-chat.sh`, `stage-chips.sh`
