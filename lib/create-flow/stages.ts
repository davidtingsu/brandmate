export type StudioFlowStage = "post" | "preview";

/** @deprecated Use StudioFlowStage — kept as alias for gradual migration */
export type CreateFlowStage = StudioFlowStage;

export function inferStudioStage(input: {
  hasAttempt: boolean;
  forcedStage?: StudioFlowStage;
}): StudioFlowStage {
  if (input.forcedStage) return input.forcedStage;
  return "post";
}

export const STUDIO_STAGE_LABELS: Record<StudioFlowStage, string> = {
  post: "Create post",
  preview: "Preview",
};

export const STUDIO_STAGE_ORDER: StudioFlowStage[] = ["post", "preview"];

/** @deprecated Use STUDIO_STAGE_ORDER */
export const STAGE_LABELS = STUDIO_STAGE_LABELS;

/** @deprecated Use STUDIO_STAGE_ORDER */
export const STAGE_ORDER = STUDIO_STAGE_ORDER;
