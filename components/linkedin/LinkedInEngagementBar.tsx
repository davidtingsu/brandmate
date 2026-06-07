"use client";

export function LinkedInEngagementBar() {
  return (
    <div className="border-t border-slate-100 pt-2">
      <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <span className="flex -space-x-1">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-100 text-[10px]">
              👍
            </span>
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-green-100 text-[10px]">
              💡
            </span>
          </span>
          <span>24</span>
        </span>
        <span>2 comments · 1 repost</span>
      </div>
      <div className="flex justify-between border-t border-slate-100 pt-1 text-xs font-medium text-slate-600">
        {["Like", "Comment", "Repost", "Send"].map((action) => (
          <button
            key={action}
            type="button"
            className="rounded px-2 py-1.5 hover:bg-slate-50"
          >
            {action}
          </button>
        ))}
      </div>
    </div>
  );
}
