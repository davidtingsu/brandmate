"use client";

import type { PostAttempt } from "@/lib/types";

interface AttemptCardProps {
  attempt: PostAttempt;
  onRetry?: () => void;
  weaveProject?: string;
}

export function AttemptCard({ attempt, onRetry, weaveProject }: AttemptCardProps) {
  const weaveUrl = weaveProject
    ? `https://wandb.ai/${weaveProject}/weave`
    : undefined;

  return (
    <div className="my-3 rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-amber-900">
          Attempt #{attempt.attemptNumber}
        </h3>
        <span className="text-lg font-bold text-amber-800">
          {attempt.judgeScore}/10
        </span>
      </div>

      {attempt.scoreBefore !== undefined && (
        <p className="mb-2 text-xs text-amber-700">
          Score improved from {attempt.scoreBefore} → {attempt.scoreAfter ?? attempt.judgeScore}
        </p>
      )}

      {attempt.problems.length > 0 && (
        <ul className="mb-3 list-inside list-disc text-sm text-amber-900">
          {attempt.problems.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-2">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-md bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
          >
            Retry with lesson
          </button>
        )}
        {weaveUrl && (
          <a
            href={weaveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100"
          >
            View in Weave
          </a>
        )}
      </div>
    </div>
  );
}
