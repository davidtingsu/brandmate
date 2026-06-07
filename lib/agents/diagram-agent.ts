import {
  chatCompletionTokenLimit,
  modelTokenBudget,
} from "@/lib/config";
import { DIAGRAM_EXPLAINER_SYSTEM_PROMPT } from "@/lib/agents/diagram-explainer-agent";
import { parseModelJson } from "@/lib/parse-model-json";
import type { DiagramAgentInput, DiagramAgentResult, SystemDiagram } from "@/lib/types";
import { CAROUSEL_MODEL, getOpenAI } from "@/lib/weave/openai";

const DIAGRAM_JSON_SCHEMA = `{
  "title": string,
  "description": string (plain-text architecture explanation for an infographic)
}`;

export async function generateSystemDiagram(
  input: DiagramAgentInput
): Promise<DiagramAgentResult> {
  const openai = getOpenAI();
  const tokenBudget = modelTokenBudget(CAROUSEL_MODEL, "diagram");

  const response = await openai.chat.completions.create({
    model: CAROUSEL_MODEL,
    ...chatCompletionTokenLimit(CAROUSEL_MODEL, tokenBudget),
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `${DIAGRAM_EXPLAINER_SYSTEM_PROMPT}

Return JSON matching this schema:
${DIAGRAM_JSON_SCHEMA}`,
      },
      {
        role: "user",
        content: `Create a system diagram description for: ${input.concept}${
          input.context ? `\n\nAdditional context: ${input.context}` : ""
        }`,
      },
    ],
  });

  const choice = response.choices[0];
  const content = choice?.message?.content;
  if (!content?.trim()) {
    throw new Error(
      `Diagram model returned empty output (finish_reason=${choice?.finish_reason ?? "unknown"}, budget=${tokenBudget}).`
    );
  }

  const raw = parseModelJson<{ diagram?: SystemDiagram } & SystemDiagram>(
    content
  );

  const candidate = raw.diagram ?? raw;
  const diagram: SystemDiagram =
    candidate.title && candidate.description
      ? {
          title: candidate.title,
          description: candidate.description,
        }
      : {
          title: input.concept,
          description:
            typeof candidate.description === "string"
              ? candidate.description
              : "Retry with a more specific concept.",
        };

  return {
    diagram,
    agentId: "diagram_explainer",
  };
}
