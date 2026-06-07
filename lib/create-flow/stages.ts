export type CreateFlowStage = "brand" | "post" | "preview";

export function inferCreateFlowStage(input: {
  hasProfile: boolean;
  hasAttempt: boolean;
  forcedStage?: CreateFlowStage;
}): CreateFlowStage {
  if (input.forcedStage) return input.forcedStage;
  if (!input.hasProfile) return "brand";
  return "post";
}

export const STAGE_LABELS: Record<CreateFlowStage, string> = {
  brand: "Brand",
  post: "Create post",
  preview: "Preview",
};

export const STAGE_ORDER: CreateFlowStage[] = ["brand", "post", "preview"];
