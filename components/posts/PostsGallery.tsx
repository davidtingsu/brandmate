"use client";

import { useChatSessionContext } from "@/contexts/ChatSessionContext";
import { useSessionLoader } from "@/hooks/useSessionLoader";
import type { GalleryThread } from "@/lib/types";
import { useState } from "react";

interface PostsGalleryProps {
  onNewPost: () => void;
  onSelectPost: (thread: GalleryThread) => void;
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

function sortThreadsByCreatedAt(threads: GalleryThread[]): GalleryThread[] {
  return [...threads].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

function threadTitle(thread: GalleryThread): string {
  return thread.displayTitle ?? thread.title ?? "Untitled post";
}

export function PostsGallery({ onNewPost, onSelectPost }: PostsGalleryProps) {
  const {
    threads,
    sessionsEnabled,
    loading,
    activeSessionId,
    setThreads,
    setActiveSessionId,
  } = useChatSessionContext();
  const { loadSessions } = useSessionLoader();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const sortedThreads = sortThreadsByCreatedAt(threads);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/sessions/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        alert(body.error ?? "Failed to delete post");
        return;
      }

      setThreads((prev) => prev.filter((t) => t.id !== id));
      if (activeSessionId === id) {
        setActiveSessionId(null);
      }
      await loadSessions();
    } finally {
      setDeletingId(null);
    }
  };

  if (!sessionsEnabled) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Your posts</h2>
            <p className="text-sm text-slate-500">
              Add Supabase to save posts in your gallery
            </p>
          </div>
          <button
            type="button"
            data-testid="create-new-post"
            onClick={onNewPost}
            className="rounded-lg bg-linkedin px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Create Post
          </button>
        </div>
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-sm text-slate-500">
            Sessions are disabled. You can still create posts in chat; they will
            not appear here until Supabase is configured.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Your posts</h2>
          <p className="text-sm text-slate-500">
            {threads.length === 0
              ? "Generated posts appear here"
              : `${threads.length} saved ${threads.length === 1 ? "post" : "posts"}`}
          </p>
        </div>
        <button
          type="button"
          data-testid="create-new-post"
          onClick={onNewPost}
          className="rounded-lg bg-linkedin px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + Create Post
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading posts…</p>
      ) : threads.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center">
          <p className="mb-4 text-sm text-slate-600">
            No posts yet. Create your first LinkedIn draft to get started.
          </p>
          <button
            type="button"
            data-testid="create-new-post"
            onClick={onNewPost}
            className="rounded-lg bg-linkedin px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Create Post
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedThreads.map((thread) => {
            const galleryThread = thread as GalleryThread;
            const title = threadTitle(galleryThread);
            const previewImage = galleryThread.previewImageUrl;

            return (
              <li key={thread.id}>
                <div
                  className={`group relative overflow-hidden rounded-xl border bg-white shadow-sm transition hover:border-linkedin/30 hover:shadow-md ${
                    activeSessionId === thread.id
                      ? "border-linkedin ring-2 ring-linkedin/20"
                      : "border-slate-200"
                  }`}
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelectPost(galleryThread)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelectPost(galleryThread);
                      }
                    }}
                    className="flex h-full w-full cursor-pointer flex-col text-left outline-none focus-visible:ring-2 focus-visible:ring-linkedin/30"
                  >
                    {previewImage ? (
                      <>
                        <div className="aspect-[4/5] w-full overflow-hidden bg-slate-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={previewImage}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="p-4 pr-14">
                          <span className="line-clamp-2 text-base font-medium text-slate-900">
                            {title}
                          </span>
                          <span className="mt-2 block text-xs text-slate-500">
                            Created {formatCreatedAt(thread.created_at)}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex min-h-[220px] flex-col justify-between bg-gradient-to-br from-slate-800 via-linkedin to-blue-600 p-5 pr-14 text-white">
                        <div>
                          <span className="line-clamp-3 text-lg font-semibold leading-snug">
                            {title}
                          </span>
                          {galleryThread.previewText && (
                            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/85">
                              {galleryThread.previewText}
                            </p>
                          )}
                        </div>
                        <span className="mt-4 text-xs text-white/70">
                          Created {formatCreatedAt(thread.created_at)}
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={deletingId === thread.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleDelete(thread.id);
                    }}
                    className="absolute right-3 top-3 rounded-md px-2 py-1 text-xs text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50 group-hover:opacity-100"
                    aria-label="Delete post"
                  >
                    {deletingId === thread.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
