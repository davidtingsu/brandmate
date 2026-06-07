"use client";

import { PostAttemptReplay } from "@/components/generative/PostAttemptReplay";
import type { BrandProfile, PostAttempt } from "@/lib/types";

interface GenerativeCardReplayProps {
  metadata: Record<string, unknown>;
  brandProfile: BrandProfile;
}

export function GenerativeCardReplay({
  metadata,
  brandProfile,
}: GenerativeCardReplayProps) {
  if (metadata.type !== "post_attempt") return null;

  const attempt = metadata.attempt as PostAttempt | undefined;
  const weaveTraceId = metadata.weaveTraceId as string | undefined;

  if (!attempt?.variants?.length) return null;

  return (
    <div className="my-2 rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-2">
      <p className="mb-2 text-xs font-medium text-slate-500">Restored draft</p>
      <PostAttemptReplay
        attempt={attempt}
        brandProfile={brandProfile}
        weaveTraceId={weaveTraceId}
      />
    </div>
  );
}
