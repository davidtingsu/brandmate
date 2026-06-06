"use client";

interface LessonCardProps {
  lesson: string;
  scoreBefore: number;
  scoreAfter?: number;
  onApprove?: () => void;
  approved?: boolean;
}

export function LessonCard({
  lesson,
  scoreBefore,
  scoreAfter,
  onApprove,
  approved,
}: LessonCardProps) {
  return (
    <div className="my-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
      <h3 className="mb-2 text-sm font-semibold text-emerald-900">Learned lesson</h3>
      <p className="mb-2 text-sm leading-relaxed text-emerald-800">{lesson}</p>
      <p className="mb-3 text-xs text-emerald-700">
        Expected improvement: {scoreBefore}/10
        {scoreAfter !== undefined ? ` → ${scoreAfter}/10` : " → higher"}
      </p>
      {onApprove && !approved && (
        <button
          type="button"
          onClick={onApprove}
          className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
        >
          Approve &amp; store in Redis
        </button>
      )}
      {approved && (
        <span className="text-xs font-medium text-emerald-700">
          Stored in Redis memory
        </span>
      )}
    </div>
  );
}
