"use client";

import { AttemptCard } from "@/components/generative/AttemptCard";
import { HumanFeedbackButtons } from "@/components/generative/HumanFeedbackButtons";
import { JudgeBreakdown } from "@/components/generative/JudgeBreakdown";
import { PostCard } from "@/components/generative/PostCard";
import { isAttemptMediaComplete } from "@/lib/attempt-media-complete";
import type { BrandProfile, PostAttempt } from "@/lib/types";

interface PostAttemptReplayProps {
  attempt: PostAttempt;
  brandProfile: BrandProfile;
  weaveTraceId?: string;
  showFeedback?: boolean;
}

export function PostAttemptReplay({
  attempt,
  brandProfile,
  weaveTraceId,
  showFeedback = false,
}: PostAttemptReplayProps) {
  if (!attempt.variants?.length) return null;

  const isDiagram = attempt.variants[0]?.format === "diagram";
  const mediaComplete = isAttemptMediaComplete(attempt);

  return (
    <>
      <PostCard
        variants={attempt.variants}
        brandProfile={brandProfile}
        topic={attempt.topic}
        branding={attempt.branding}
      />
      {mediaComplete && (
        <>
          <JudgeBreakdown
            breakdown={attempt.breakdown}
            score={attempt.judgeScore}
          />
          {attempt.judgeFeedback?.trim() && (
            <p className="my-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              {attempt.judgeFeedback}
            </p>
          )}
          <AttemptCard
            attempt={attempt}
            weaveProject={weaveTraceId ?? attempt.weaveTraceId}
          />
          {showFeedback && !isDiagram && (
            <HumanFeedbackButtons
              onSelect={async (feedback) => {
                await fetch("/api/agents/memory", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    action: "feedback",
                    feedbackType: feedback,
                    scoreBefore: attempt.judgeScore,
                    traceId: attempt.weaveTraceId,
                  }),
                });
              }}
            />
          )}
        </>
      )}
    </>
  );
}
