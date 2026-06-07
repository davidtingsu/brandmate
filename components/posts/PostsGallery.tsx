"use client";

import { useChatSessionContext } from "@/contexts/ChatSessionContext";
import type { ChatThread } from "@/lib/types";

interface PostsGalleryProps {
  onNewPost: () => void;
  onSelectPost: (thread: ChatThread) => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function PostsGallery({ onNewPost, onSelectPost }: PostsGalleryProps) {
  const {
    threads,
    sessionsEnabled,
    loading,
    activeSessionId,
    setThreads,
  } = useChatSessionContext();

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    const res = await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    if (!res.ok) return;
    setThreads(threads.filter((t) => t.id !== id));
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
          {threads.map((thread) => (
            <li key={thread.id}>
              <div
                className={`group relative rounded-xl border bg-white shadow-sm transition hover:border-linkedin/30 hover:shadow-md ${
                  activeSessionId === thread.id
                    ? "border-linkedin ring-2 ring-linkedin/20"
                    : "border-slate-200"
                }`}
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectPost(thread)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectPost(thread);
                    }
                  }}
                  className="flex h-full w-full cursor-pointer flex-col p-5 pr-16 text-left outline-none focus-visible:ring-2 focus-visible:ring-linkedin/30"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 text-linkedin">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                      />
                    </svg>
                  </div>
                  <span className="line-clamp-2 flex-1 text-base font-medium text-slate-900">
                    {thread.title ?? "Untitled post"}
                  </span>
                  <span className="mt-3 text-xs text-slate-500">
                    Updated {formatDate(thread.updated_at)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => void handleDelete(thread.id)}
                  className="absolute right-3 top-3 rounded-md px-2 py-1 text-xs text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                  aria-label="Delete post"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
