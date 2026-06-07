# REQ-PREVIEW: LinkedIn feed preview

## REQ-PREVIEW-001

`/preview/[sessionId]` without CopilotChat.

- AC1: Preview page imports feed components, not CopilotChat

## REQ-PREVIEW-002

Approved post resolved from session messages.

- AC1: `findApprovedPost` / `resolvePreviewPost` used

## REQ-PREVIEW-003

LinkedIn mock renders variants.

- AC1: Build passes with preview components

## Verification

- automated: `guided-flow.sh`, build
