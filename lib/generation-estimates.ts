import type { PostFormat } from "@/lib/types";

export type GenerationPhase = "orchestrating" | "rendering" | "diagram";

export interface GenerationPreview {
  active: boolean;
  topic: string;
  format: PostFormat;
  includeImage: boolean;
  slideCount: number;
  startedAt: number;
  phase: GenerationPhase;
}

export const GENERATION_ESTIMATE_MS = {
  text: 45_000,
  image: 120_000,
  diagram: 120_000,
  carousel: 180_000,
} as const;

export function resolveGenerationEstimateMs(preview: GenerationPreview): number {
  if (preview.format === "carousel") return GENERATION_ESTIMATE_MS.carousel;
  if (preview.format === "diagram") return GENERATION_ESTIMATE_MS.diagram;
  if (preview.includeImage) return GENERATION_ESTIMATE_MS.image;
  return GENERATION_ESTIMATE_MS.text;
}

export function computeEstimatedProgress(
  startedAt: number,
  estimateMs: number,
  complete = false
): number {
  if (complete) return 100;
  const elapsed = Date.now() - startedAt;
  const ratio = Math.min(1, elapsed / estimateMs);
  return Math.min(95, Math.round(ratio * 100));
}

export function formatTimeRemaining(startedAt: number, estimateMs: number): string {
  const elapsed = Date.now() - startedAt;
  const remainingSec = Math.max(0, Math.ceil((estimateMs - elapsed) / 1000));
  return `~${remainingSec}s remaining`;
}

export function generationStatusLabel(preview: GenerationPreview): string {
  if (preview.format === "carousel") {
    return preview.phase === "rendering"
      ? "Generating carousel slides"
      : "Writing carousel post";
  }
  if (preview.format === "diagram") {
    return preview.phase === "diagram"
      ? "Generating system diagram"
      : "Writing post copy";
  }
  if (preview.includeImage) {
    return "Generating post and image";
  }
  return "Writing post";
}
