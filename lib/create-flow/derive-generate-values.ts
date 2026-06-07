import type { GeneratePostValues } from "@/components/forms/GeneratePostForm";
import type { GeneratePostParams } from "@/lib/create-flow/generate-params";
import type { PostAttempt } from "@/lib/types";

export function deriveGenerateValuesFromAttempt(
  attempt: PostAttempt
): GeneratePostValues {
  const variant = attempt.variants[0];
  const pipelineFormat = variant?.format ?? "text";
  const includeImage =
    pipelineFormat === "text" && Boolean(variant?.image?.url);

  return {
    topic: attempt.topic,
    format:
      pipelineFormat === "carousel" || pipelineFormat === "diagram"
        ? pipelineFormat
        : "text",
    includeImage,
    slideCount: variant?.slides?.length ?? 7,
    branding: attempt.branding,
  };
}

export function deriveGenerateParamsFromAttempt(
  attempt: PostAttempt
): GeneratePostParams {
  const values = deriveGenerateValuesFromAttempt(attempt);
  const variant = attempt.variants[0];

  return {
    topic: values.topic,
    format: values.format,
    includeImage: values.includeImage,
    slideCount: values.slideCount,
    postType: variant?.postType ?? "story",
    branding: values.branding,
    includeHandle: values.branding?.includeHandle,
    includeProfileImage: values.branding?.includeProfileImage,
  };
}
