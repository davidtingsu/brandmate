# REQ-AGENT: Agent pipeline and memory

## REQ-AGENT-001

Orchestrate post loop API.

- AC1: `app/api/agents/orchestrate/route.ts` exists

## REQ-AGENT-002

Memory feedback and store APIs.

- AC1: `app/api/agents/memory/route.ts` and `app/api/memory/store/route.ts`

## REQ-AGENT-003

Redis lesson store.

- AC1: `lib/redis/lesson-store.ts` exists

## REQ-AGENT-004

Weave tracing.

- AC1: `lib/weave/ops.ts` and `instrumentation.ts`

## REQ-AGENT-005

CopilotKit multi-route mode (supports GET `/threads`, POST `/agent/.../run`, etc.).

- AC1: `mode: "multi-route"` in copilotkit route
- AC2: `useSingleEndpoint={false}` on `<CopilotKit>` in create chat (REST transport; matches multi-route server)

## Verification

- automated: `copilotkit-route.sh`, build
