"use client";

import { PostAttemptReplay } from "@/components/generative/PostAttemptReplay";
import type { PostAttemptRecord } from "@/lib/sessions/approved-post";
import type { BrandProfile } from "@/lib/types";

interface PostAttemptHistoryProps {
  history: PostAttemptRecord[];
  brandProfile: BrandProfile;
}

function attemptSummary(record: PostAttemptRecord): string {
  const { attempt } = record;
  const parts = [`Attempt #${attempt.attemptNumber}`, `${attempt.judgeScore}/10`];
  if (attempt.problems.length > 0) {
    const label = attempt.problems.length === 1 ? "issue" : "issues";
    parts.push(`${attempt.problems.length} ${label}`);
  }
  return parts.join(" · ");
}

export function PostAttemptHistory({
  history,
  brandProfile,
}: PostAttemptHistoryProps) {
  if (history.length === 0) return null;

  return (
    <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50/80 p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Previous attempts ({history.length})
      </p>
      <div className="space-y-2">
        {[...history].reverse().map((record) => (
          <details
            key={record.attempt.attemptNumber}
            className="group rounded-lg border border-slate-200 bg-white"
          >
            <summary className="cursor-pointer list-none px-3 py-2.5 text-sm font-medium text-slate-700 marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-2">
                <span>{attemptSummary(record)}</span>
                <span className="text-xs font-normal text-slate-400 group-open:hidden">
                  Show
                </span>
              </span>
            </summary>
            <div className="border-t border-slate-100 px-2 pb-2 pt-1">
              <PostAttemptReplay
                attempt={record.attempt}
                brandProfile={brandProfile}
                weaveTraceId={record.weaveTraceId}
                showFeedback={false}
              />
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
