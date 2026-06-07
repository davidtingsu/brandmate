import { generateSystemDiagram } from "@/lib/agents/diagram-agent";
import { DIAGRAM_EXPLAINER_SYSTEM_PROMPT } from "@/lib/agents/diagram-explainer-agent";
import { MODEL } from "@/lib/config";
import {
  BuiltInAgent,
  CopilotRuntime,
  createCopilotRuntimeHandler,
  defineTool,
  InMemoryAgentRunner,
} from "@copilotkit/runtime/v2";
import { z } from "zod";

const BRANDMATE_COACH_PROMPT = `You are BrandMate, a LinkedIn personal brand coach in the post studio (2-step guided flow):

Step 1 — Create post: User generates via the guided panel. Profile onboarding is already complete. Coach them to refine with submitHumanFeedback, storeLesson, and retryWithLesson. Do not approve until Step 2.
Step 2 — Preview: User clicks Preview in feed. Only then use approvePost.

Primary UI is the guided step panel; HITL forms are fallbacks only.`;

const runtime = new CopilotRuntime({
  agents: {
    default: new BuiltInAgent({
      model: `openai/${MODEL}`,
      apiKey: process.env.OPENAI_API_KEY,
      prompt: BRANDMATE_COACH_PROMPT,
    }),
    diagram_explainer: new BuiltInAgent({
      model: `openai/${MODEL}`,
      apiKey: process.env.OPENAI_API_KEY,
      prompt: DIAGRAM_EXPLAINER_SYSTEM_PROMPT,
      maxSteps: 2,
      tools: [
        defineTool({
          name: "generate_system_diagram",
          description:
            "Generate a ByteByteGo-style structured system diagram for a technical concept",
          parameters: z.object({
            concept: z.string().describe("The concept to illustrate"),
            context: z
              .string()
              .optional()
              .describe("Optional audience or angle"),
          }),
          execute: async ({ concept, context }) => {
            return generateSystemDiagram({ concept, context });
          },
        }),
      ],
    }),
  },
  runner: new InMemoryAgentRunner(),
});

const handler = createCopilotRuntimeHandler({
  runtime,
  basePath: "/api/copilotkit",
  mode: "single-route",
  cors: true,
});

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
export const OPTIONS = handler;
