import { MAX_TOKENS } from "@/lib/config";
import { DIAGRAM_EXPLAINER_SYSTEM_PROMPT } from "@/lib/agents/diagram-explainer-agent";
import type { DiagramAgentInput, DiagramAgentOutput, SystemDiagram } from "@/lib/types";
import { getOpenAI, MODEL } from "@/lib/weave/openai";

async function parseJson<T>(content: string): Promise<T> {
  const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
  return JSON.parse(cleaned) as T;
}

const DIAGRAM_JSON_SCHEMA = `{
  "title": string,
  "subtitle": string (optional),
  "summary": string (one sentence overview),
  "phases": [
    {
      "id": string (slug),
      "label": string (phase title, e.g. "Phase 1: Resolve Domain Name"),
      "color": "purple" | "green" | "brown" | "blue" | "yellow" | "slate",
      "steps": [
        {
          "number": number (optional),
          "title": string,
          "description": string (optional),
          "items": string[] (optional bullet list),
          "highlight": string (optional key result),
          "code": string (optional monospace block)
        }
      ],
      "nodes": [{ "id": string, "label": string, "icon": "browser"|"client"|"server"|"dns"|"database"|"cache" }] (optional)
    }
  ],
  "flows": [{ "from": string, "to": string, "label": string (optional), "style": "solid"|"dashed" }] (optional)
}`;

export async function generateSystemDiagram(
  input: DiagramAgentInput
): Promise<DiagramAgentOutput> {
  const openai = getOpenAI();

  const response = await openai.chat.completions.create({
    model: MODEL,
    max_tokens: MAX_TOKENS.diagram,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `${DIAGRAM_EXPLAINER_SYSTEM_PROMPT}

Return JSON matching this schema:
${DIAGRAM_JSON_SCHEMA}

Style reference: ByteByteGo infographics — color-coded horizontal phases, numbered green step badges, dashed lines for background processes, solid arrows for main flow, code blocks for headers/handshakes.`,
      },
      {
        role: "user",
        content: `Create a system diagram explaining: ${input.concept}${
          input.context ? `\n\nAdditional context: ${input.context}` : ""
        }`,
      },
    ],
  });

  const raw = await parseJson<{ diagram?: SystemDiagram } & SystemDiagram>(
    response.choices[0]?.message?.content ?? "{}"
  );

  const diagram: SystemDiagram =
    raw.diagram ??
    (raw.title && raw.phases ? (raw as SystemDiagram) : null) ??
    ({
      title: input.concept,
      summary: "Diagram generation returned incomplete data.",
      phases: [
        {
          id: "fallback",
          label: "Overview",
          color: "slate",
          steps: [
            {
              number: 1,
              title: input.concept,
              description: "Retry with a more specific concept.",
            },
          ],
        },
      ],
    } satisfies SystemDiagram);

  return {
    diagram,
    agentId: "diagram_explainer",
  };
}
