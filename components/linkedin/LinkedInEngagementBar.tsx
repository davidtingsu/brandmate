"use client";

export function LinkedInEngagementBar() {
  return (
    <div className="border-t border-slate-100 pt-2">
      <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="flex -space-x-1">
            <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full bg-blue-100 text-[10px]">
              👍
            </span>
            <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full bg-amber-100 text-[10px]">
              👏
            </span>
            <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full bg-red-100 text-[10px]">
              ❤️
            </span>
          </span>
          <span className="font-medium text-slate-600">1,207</span>
        </span>
        <span>104 comments · 4 reposts</span>
      </div>
      <div className="flex justify-between border-t border-slate-100 pt-1 text-xs font-semibold text-slate-600">
        {["Like", "Comment", "Repost", "Send"].map((action) => (
          <button
            key={action}
            type="button"
            className="flex-1 rounded px-2 py-2 hover:bg-slate-50"
          >
            {action}
          </button>
        ))}
      </div>
    </div>
  );
}
