"use client";

interface PreviewPostBarProps {
  onPreview: () => void;
}

export function PreviewPostBar({ onPreview }: PreviewPostBarProps) {
  return (
    <div className="border-t border-slate-200 bg-blue-50/60 px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-700">
          Feedback recorded. Open the full LinkedIn preview in your workspace.
        </p>
        <button
          type="button"
          onClick={onPreview}
          className="rounded-lg bg-linkedin px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Preview Post
        </button>
      </div>
    </div>
  );
}
