"use client";

import { SystemDiagramCard } from "@/components/generative/SystemDiagramCard";
import { DIAGRAM_EXPLAINER_AGENT_ID } from "@/lib/config";
import type { DiagramAgentOutput, SystemDiagram } from "@/lib/types";
import { useCopilotAction } from "@copilotkit/react-core";

export function useDiagramAgent() {
  useCopilotAction({
    name: "dispatchDiagramAgent",
    description: `Dispatch the dedicated ${DIAGRAM_EXPLAINER_AGENT_ID} to explain a technical/system concept with a ByteByteGo-style infographic diagram. Use whenever the user asks HOW something works — protocols, architecture, pipelines, request lifecycles, auth flows, DNS, HTTP, caching, etc. Do not explain in long prose; dispatch this agent instead.`,
    parameters: [
      {
        name: "concept",
        type: "string",
        description:
          'The concept to explain, e.g. "what happens when you type a URL in a browser"',
        required: true,
      },
      {
        name: "context",
        type: "string",
        description:
          "Optional audience or angle (e.g. for a LinkedIn post about system design)",
        required: false,
      },
    ],
    handler: async ({ concept, context }) => {
      const res = await fetch("/api/agents/diagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concept, context }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          (err as { error?: string }).error ?? "Diagram agent failed"
        );
      }
      return (await res.json()) as DiagramAgentOutput;
    },
    render: ({ status, result }) => {
      if (status === "inProgress") {
        return (
          <div className="my-3 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-800">
            <span className="font-medium">diagram_explainer</span> is building
            your system diagram…
          </div>
        );
      }
      if (status !== "complete" || !result?.diagram) return <></>;
      return (
        <SystemDiagramCard
          diagram={result.diagram as SystemDiagram}
          agentLabel={result.agentId as string}
        />
      );
    },
  });
}
