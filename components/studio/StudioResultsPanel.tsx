"use client";

import { AttemptCard } from "@/components/generative/AttemptCard";
import { HumanFeedbackButtons } from "@/components/generative/HumanFeedbackButtons";
import { JudgeBreakdown } from "@/components/generative/JudgeBreakdown";
import { LessonCard } from "@/components/generative/LessonCard";
import { PostCard } from "@/components/generative/PostCard";
import type { WorkflowPhase } from "@/hooks/useBrandMateWorkflow";
import type {
  BrandProfile,
  HumanFeedbackType,
  PostAttempt,
} from "@/lib/types";

interface StudioResultsPanelProps {
  phase: WorkflowPhase;
  attempt: PostAttempt | null;
  weaveTraceId?: string;
  pendingLesson: {
    lesson: string;
    scoreBefore: number;
  } | null;
  lessonStored: boolean;
  selectedFeedback?: HumanFeedbackType;
  brandProfile: BrandProfile;
  onFeedback: (feedback: HumanFeedbackType) => void;
  onStoreLesson: () => void;
  onSkipStoreLesson: () => void;
}

export function StudioResultsPanel({
  phase,
  attempt,
  weaveTraceId,
  pendingLesson,
  lessonStored,
  selectedFeedback,
  brandProfile,
  onFeedback,
  onStoreLesson,
  onSkipStoreLesson,
}: StudioResultsPanelProps) {
  if (phase === "idle" && !attempt) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <p className="max-w-md text-sm text-slate-600">
          Enter a topic below and click <strong>Generate</strong> to create your
          LinkedIn post. Results and feedback will appear here.
        </p>
      </div>
    );
  }

  if (phase === "generating" && !attempt) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-sm text-slate-500">Generating your post…</p>
      </div>
    );
  }

  if (!attempt) return null;

  return (
    <div className="flex-1 space-y-2 overflow-y-auto p-4">
      {phase === "generating" && (
        <p className="text-sm text-slate-500">Processing…</p>
      )}
      <PostCard
        variants={attempt.variants}
        brandProfile={brandProfile}
        topic={attempt.topic}
        branding={attempt.branding}
      />
      <JudgeBreakdown breakdown={attempt.breakdown} score={attempt.judgeScore} />
      <AttemptCard attempt={attempt} weaveProject={weaveTraceId} />

      {(phase === "awaiting_feedback" || phase === "generating") &&
        attempt.variants[0]?.format !== "diagram" && (
          <HumanFeedbackButtons
            onSelect={onFeedback}
            selected={selectedFeedback}
            disabled={phase === "generating"}
          />
        )}

      {pendingLesson && (phase === "feedback_done" || phase === "preview_ready") && (
        <>
          <LessonCard
            lesson={pendingLesson.lesson}
            scoreBefore={pendingLesson.scoreBefore}
            approved={lessonStored}
          />
          {phase === "feedback_done" && !lessonStored && (
            <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-4">
              <button
                type="button"
                onClick={onStoreLesson}
                className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900"
              >
                Store lesson
              </button>
              <button
                type="button"
                onClick={onSkipStoreLesson}
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
              >
                Skip for now
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
