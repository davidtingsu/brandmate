"use client";

import { summarizePostTitle } from "@/lib/sessions/summarize-title";

export interface PostGalleryCardProps {
  title: string;
  previewImageUrl?: string;
  previewText?: string;
  createdAt?: string;
  onClick: () => void;
  showDelete?: boolean;
  onDelete?: () => void;
  deleting?: boolean;
  active?: boolean;
}

function formatCreatedAt(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function PostGalleryCard({
  title,
  previewImageUrl,
  previewText,
  createdAt,
  onClick,
  showDelete = false,
  onDelete,
  deleting = false,
  active = false,
}: PostGalleryCardProps) {
  const displayTitle = title.trim() || "Untitled post";

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border bg-white shadow-sm transition hover:border-linkedin/30 hover:shadow-md ${
        active
          ? "border-linkedin ring-2 ring-linkedin/20"
          : "border-slate-200"
      }`}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        }}
        className="flex h-full w-full cursor-pointer flex-col text-left outline-none focus-visible:ring-2 focus-visible:ring-linkedin/30"
      >
        {previewImageUrl ? (
          <>
            <div className="aspect-[4/5] w-full overflow-hidden bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewImageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className={`p-4 ${showDelete ? "pr-14" : ""}`}>
              <span className="line-clamp-2 text-base font-medium text-slate-900">
                {displayTitle}
              </span>
              {createdAt && (
                <span className="mt-2 block text-xs text-slate-500">
                  Created {formatCreatedAt(createdAt)}
                </span>
              )}
            </div>
          </>
        ) : (
          <div
            className={`flex min-h-[220px] flex-col justify-between bg-gradient-to-br from-slate-800 via-linkedin to-blue-600 p-5 text-white ${
              showDelete ? "pr-14" : ""
            }`}
          >
            <div>
              <span className="line-clamp-3 text-lg font-semibold leading-snug">
                {displayTitle}
              </span>
              {previewText && (
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/85">
                  {previewText}
                </p>
              )}
            </div>
            {createdAt && (
              <span className="mt-4 text-xs text-white/70">
                Created {formatCreatedAt(createdAt)}
              </span>
            )}
          </div>
        )}
      </div>
      {showDelete && onDelete && (
        <button
          type="button"
          disabled={deleting}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute right-3 top-3 rounded-md px-2 py-1 text-xs text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50 group-hover:opacity-100"
          aria-label="Delete post"
        >
          {deleting ? "Deleting…" : "Delete"}
        </button>
      )}
    </div>
  );
}

export function galleryTitleFromTopic(topic: string): string {
  return summarizePostTitle(topic);
}
