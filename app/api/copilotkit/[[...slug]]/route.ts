import { generateSystemDiagram } from "@/lib/agents/diagram-agent";
import {
  BRANDMATE_COACH_DIAGRAM_DISPATCH,
  DIAGRAM_EXPLAINER_SYSTEM_PROMPT,
} from "@/lib/agents/diagram-explainer-agent";
import { MODEL } from "@/lib/config";
import {
  BuiltInAgent,
  CopilotRuntime,
  createCopilotRuntimeHandler,
  defineTool,
  InMemoryAgentRunner,
} from "@copilotkit/runtime/v2";
import { z } from "zod";

const BRANDMATE_COACH_PROMPT = `You are BrandMate, a LinkedIn personal brand coach.
Help users create on-brand posts with structured forms and generative UI cards.
Use collectBrandProfile, collectPostRequest, createPost, feedback actions, and approve flow.

${BRANDMATE_COACH_DIAGRAM_DISPATCH}`;

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
