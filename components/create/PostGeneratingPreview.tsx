"use client";

import { PostTextSkeleton } from "@/components/create/PostTextSkeleton";
import { PostCard } from "@/components/generative/PostCard";
import { ImageGeneratingPlaceholder } from "@/components/linkedin/ImageGeneratingPlaceholder";
import { LinkedInCarouselPreview } from "@/components/linkedin/LinkedInCarouselPreview";
import { useGenerationProgress } from "@/hooks/useGenerationProgress";
import { isAttemptMediaComplete } from "@/lib/attempt-media-complete";
import {
  generationStatusLabel,
  resolveGenerationEstimateMs,
  type GenerationPreview,
} from "@/lib/generation-estimates";
import { buildLinkedInPost } from "@/lib/linkedin-format";
import type { BrandProfile, LinkedInPost, PostAttempt, PostBrandingOptions } from "@/lib/types";

interface PostGeneratingPreviewProps {
  preview: GenerationPreview;
  brandProfile: BrandProfile;
  lastAttempt?: PostAttempt | null;
  branding?: PostBrandingOptions;
}

function buildPlaceholderCarouselPost(
  preview: GenerationPreview
): LinkedInPost {
  const slides = Array.from({ length: preview.slideCount }, (_, index) => ({
    index,
    title: "",
    body: "",
    pngStatus: "pending" as const,
  }));

  return buildLinkedInPost({
    hook: "",
    body: "",
    postType: "story",
    format: "carousel",
    slides,
  });
}

function hasPostCopy(attempt: PostAttempt | null | undefined): boolean {
  const post = attempt?.variants[0];
  return Boolean(post?.hook?.trim() || post?.body?.trim());
}

function needsImagePlaceholder(
  preview: GenerationPreview,
  attempt: PostAttempt | null | undefined
): boolean {
  if (preview.format === "diagram") {
    const post = attempt?.variants[0];
    return !post?.image?.url;
  }
  if (preview.includeImage) {
    const post = attempt?.variants[0];
    return !post?.image?.url;
  }
  return false;
}

export function PostGeneratingPreview({
  preview,
  brandProfile,
  lastAttempt,
  branding,
}: PostGeneratingPreviewProps) {
  const estimateMs = resolveGenerationEstimateMs(preview);
  const { progress, timeRemaining } = useGenerationProgress(
    preview.startedAt,
    estimateMs
  );
  const statusLabel = generationStatusLabel(preview);
  const postCopyReady = hasPostCopy(lastAttempt);

  const showCarousel =
    preview.format === "carousel" &&
    (!lastAttempt || !isAttemptMediaComplete(lastAttempt));
  const showImagePlaceholder = needsImagePlaceholder(preview, lastAttempt);

  const carouselPost =
    lastAttempt?.variants[0]?.format === "carousel"
      ? lastAttempt.variants[0]
      : buildPlaceholderCarouselPost(preview);

  return (
    <div className="mt-4 space-y-3" data-testid="post-generating-preview">
      <p className="text-sm font-medium text-slate-600">
        {statusLabel} · {timeRemaining}
      </p>

      {postCopyReady && lastAttempt ? (
        preview.format === "carousel" ? (
          <div className="my-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-slate-800">
              LinkedIn Post
            </h3>
            <LinkedInCarouselPreview
              post={carouselPost}
              profile={brandProfile}
              topic={lastAttempt.topic}
              branding={branding ?? lastAttempt.branding}
              slideImageProgress={progress}
              slideTimeRemaining={timeRemaining}
            />
          </div>
        ) : (
          <PostCard
            variants={lastAttempt.variants}
            brandProfile={brandProfile}
            topic={lastAttempt.topic}
            branding={branding ?? lastAttempt.branding}
            loadingImageProgress={showImagePlaceholder ? progress : undefined}
            loadingTimeRemaining={showImagePlaceholder ? timeRemaining : undefined}
          />
        )
      ) : (
        <>
          <PostTextSkeleton profile={brandProfile} />
          {showCarousel && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <LinkedInCarouselPreview
                post={carouselPost}
                profile={brandProfile}
                topic={preview.topic}
                branding={branding}
                slideImageProgress={progress}
                slideTimeRemaining={timeRemaining}
              />
            </div>
          )}
          {showImagePlaceholder && !showCarousel && (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <ImageGeneratingPlaceholder
                progress={progress}
                timeRemaining={timeRemaining}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
