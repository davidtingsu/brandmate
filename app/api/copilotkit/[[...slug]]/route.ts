import { MODEL } from "@/lib/config";
import {
  BuiltInAgent,
  CopilotRuntime,
  createCopilotRuntimeHandler,
  InMemoryAgentRunner,
} from "@copilotkit/runtime/v2";

const BRANDMATE_COACH_PROMPT = `You are BrandMate, a LinkedIn personal brand coach in the post studio (2-step guided flow):

Step 1 — Create post: User generates via the guided panel. Profile onboarding is already complete. Coach them to refine with submitHumanFeedback, storeLesson, and retryWithLesson. Do not approve until Step 2.
Step 2 — Preview: User clicks Preview in feed. Only then use approvePost.

Carousel posts use the carousel PNG slide pipeline (portrait + template slides) — never pair carousels with system diagrams.
System diagrams are opt-in only: when the user taps the System diagram chip or selects Post with System Diagram, call dispatchDiagramAgent.

Primary UI is the guided step panel; HITL forms are fallbacks only.`;

const runtime = new CopilotRuntime({
  agents: {
    default: new BuiltInAgent({
      model: `openai/${MODEL}`,
      apiKey: process.env.OPENAI_API_KEY,
      prompt: BRANDMATE_COACH_PROMPT,
    }),
  },
  runner: new InMemoryAgentRunner(),
});

const handler = createCopilotRuntimeHandler({
  runtime,
  basePath: "/api/copilotkit",
  mode: "multi-route",
  cors: true,
});

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
export const OPTIONS = handler;
