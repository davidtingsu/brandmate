import type { CreateFlowStage } from "@/lib/create-flow/stages";

export interface StageChip {
  id: string;
  label: string;
  message: string;
}

export const STAGE_CHIPS: Record<CreateFlowStage, StageChip[]> = {
  brand: [
    {
      id: "niche",
      label: "Help with niche",
      message: "Help me define my niche for LinkedIn content.",
    },
    {
      id: "voice",
      label: "Help with voice",
      message: "Help me describe my voice and tone for posts.",
    },
    {
      id: "audience",
      label: "Who is my audience?",
      message: "Who should I target as my LinkedIn audience?",
    },
  ],
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

export function getStageChips(stage: CreateFlowStage): StageChip[] {
  return STAGE_CHIPS[stage];
}

export function stageChipsToSuggestions(
  stage: CreateFlowStage
): StageSuggestion[] {
  return STAGE_CHIPS[stage].map((chip) => ({
    title: chip.label,
    message: chip.message,
  }));
}
