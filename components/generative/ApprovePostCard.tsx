"use client";

interface ApprovePostCardProps {
  onPreview: () => void;
  disabled?: boolean;
}

export function ApprovePostCard({ onPreview, disabled }: ApprovePostCardProps) {
  return (
    <div className="my-3 rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
      <p className="mb-3 text-sm text-slate-700">
        Happy with this draft? Preview how it looks in the LinkedIn feed.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onPreview}
          disabled={disabled}
          className="rounded-lg bg-linkedin px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Preview in feed
        </button>
      </div>
    </div>
  );
}
