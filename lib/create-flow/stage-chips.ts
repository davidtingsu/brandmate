import type { StudioFlowStage } from "@/lib/create-flow/stages";

export interface StageChip {
  id: string;
  label: string;
  message: string;
}

export const STAGE_CHIPS: Record<StudioFlowStage, StageChip[]> = {
  post: [
    {
      id: "score",
      label: "Explain judge score",
      message: "Explain the judge score on my latest draft.",
    },
    {
      id: "retry",
      label: "Retry with lessons",
      message: "Retry my post using lessons from past feedback.",
    },
    {
      id: "generic",
      label: "Make it less generic",
      message: "Make my draft less generic and more specific to my brand.",
    },
    {
      id: "diagram",
      label: "System diagram",
      message:
        "I want a post with a system diagram. Use dispatchDiagramAgent to build the ByteByteGo-style infographic for my topic, then help me refine the LinkedIn copy.",
    },
  ],
  preview: [
    {
      id: "check",
      label: "What to check?",
      message: "What should I check before posting this draft?",
    },
    {
      id: "hook",
      label: "Improve the hook",
      message: "How can I improve the opening hook before I post?",
    },
    {
      id: "cta",
      label: "Stronger CTA",
      message: "Suggest a stronger call-to-action for this post.",
    },
  ],
};

export interface StageSuggestion {
  title: string;
  message: string;
}

export function getStageChips(stage: StudioFlowStage): StageChip[] {
  return STAGE_CHIPS[stage];
}

export function stageChipsToSuggestions(
  stage: StudioFlowStage
): StageSuggestion[] {
  return STAGE_CHIPS[stage].map((chip) => ({
    title: chip.label,
    message: chip.message,
  }));
}
