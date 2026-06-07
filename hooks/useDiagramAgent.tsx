"use client";

import { SystemDiagramCard } from "@/components/generative/SystemDiagramCard";
import { DIAGRAM_EXPLAINER_AGENT_ID } from "@/lib/config";
import type { DiagramAgentOutput, PostFormat, SystemDiagram } from "@/lib/types";
import { useCopilotAction } from "@copilotkit/react-core";

interface UseDiagramAgentOptions {
  getActiveFormat?: () => PostFormat;
}

export function useDiagramAgent(options?: UseDiagramAgentOptions) {
  useCopilotAction({
    name: "dispatchDiagramAgent",
    description: `Dispatch ${DIAGRAM_EXPLAINER_AGENT_ID} to build a ByteByteGo-style system diagram. Use ONLY when the user explicitly asks via the "System diagram" chip, selects "Post with System Diagram" in the form, or clearly requests a diagram post. Never use for carousel posts.`,
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
      if (options?.getActiveFormat?.() === "carousel") {
        throw new Error(
          "System diagrams are not used for carousel posts. Use Text, Image, or the System diagram format instead."
        );
      }

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
            <span className="font-medium">{DIAGRAM_EXPLAINER_AGENT_ID}</span> is
            building your system diagram…
          </div>
        );
      }
      if (
        status !== "complete" ||
        !result?.diagram ||
        !result.imageUrl
      ) {
        return <></>;
      }
      return (
        <SystemDiagramCard
          diagram={result.diagram as SystemDiagram}
          imageUrl={result.imageUrl as string}
          agentLabel={result.agentId as string}
        />
      );
    },
  });
}
