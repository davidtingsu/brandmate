# REQ-DIAGRAM-IMG: ByteByteGo diagram image generation

## REQ-DIAGRAM-IMG-001

Plain-text diagram description from diagram agent.

- AC1: `SystemDiagram` is `{ title, description }` in `lib/types.ts`
- AC2: `diagram-agent.ts` prompts for title + description (not phases)

## REQ-DIAGRAM-IMG-002

Image generation with ByteByteGo reference.

- AC1: `lib/pipeline/diagram-image-gen.ts` uses `images.edit` with reference PNG
- AC2: `public/examples/bytebytego-architecture-reference.png` exists
- AC3: `app/api/agents/diagram/route.ts` calls `generateDiagramImage`

## REQ-DIAGRAM-IMG-003

No prescriptive color legend in prompts.

- AC1: Image prompt infers colors from reference (no fixed component→color mapping in code)

## REQ-DIAGRAM-IMG-004

Diagram branding replaces ByteByteGo logo with author brand name.

- AC1: Prompt instructs removal of ByteByteGo logo
- AC2: Prompt places author `brandName` in logo area
- AC3: Diagram route accepts and forwards `brandName`

## Verification

- automated: `diagram-image.sh`
- scope: `--scope diagram` or `all`
