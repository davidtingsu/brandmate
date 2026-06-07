import type { StudioFlowStage } from "@/lib/create-flow/stages";
import type { PostAttempt } from "@/lib/types";

export interface StageChip {
  id: string;
  label: string;
  message: string;
}

export const STAGE_CHIPS: Record<StudioFlowStage, StageChip[]> = {
  post: [
    {
      id: "retry-judge",
      label: "Retry with Judge feedback",
      message:
        "Retry using the judge breakdown and problems on my latest draft. Call retryWithJudgeFeedback with the same topic. If I added extra instructions in chat, pass them as userFeedback.",
    },
    {
      id: "regenerate",
      label: "Regenerate post",
      message:
        "Regenerate my post with the same format and post type as the latest draft. Call regeneratePost. If I added extra instructions in chat, pass them as userFeedback.",
    },
    {
      id: "score",
      label: "Explain judge score",
      message: "Explain the judge score on my latest draft.",
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

export function hasGeneratedPost(attempt: PostAttempt | null): boolean {
  return Boolean(attempt?.variants?.length);
}

export function hasJudgeFeedback(attempt: PostAttempt | null): boolean {
  if (!attempt) return false;
  return (
    attempt.judgeScore > 0 ||
    attempt.problems.length > 0 ||
    Boolean(attempt.judgeFeedback?.trim())
  );
}

export function isPostChipEnabled(
  chipId: string,
  attempt: PostAttempt | null
): boolean {
  if (chipId === "regenerate") return hasGeneratedPost(attempt);
  if (chipId === "retry-judge" || chipId === "score") {
    return hasJudgeFeedback(attempt);
  }
  return true;
}

export function getEnabledPostChips(attempt: PostAttempt | null): StageChip[] {
  return STAGE_CHIPS.post.filter((chip) =>
    isPostChipEnabled(chip.id, attempt)
  );
}
