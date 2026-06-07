"use client";

import { PostGalleryCard } from "@/components/posts/PostGalleryCard";
import { useChatSessionContext } from "@/contexts/ChatSessionContext";
import { useSessionLoader } from "@/hooks/useSessionLoader";
import type { GalleryThread } from "@/lib/types";
import { useState } from "react";

interface PostsGalleryProps {
  onNewPost: () => void;
  onSelectPost: (thread: GalleryThread) => void;
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
    loadError,
    sessionsLoadedOnce,
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

  if (loadError) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Your posts</h2>
            <p className="text-sm text-slate-500">{loadError}</p>
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
        <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50 p-8 text-center">
          <p className="mb-4 text-sm text-slate-700">
            Couldn&apos;t load saved posts.
          </p>
          <button
            type="button"
            onClick={() => void loadSessions()}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!sessionsEnabled && sessionsLoadedOnce) {
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
                <PostGalleryCard
                  title={title}
                  previewImageUrl={previewImage}
                  previewText={galleryThread.previewText}
                  createdAt={thread.created_at}
                  active={activeSessionId === thread.id}
                  showDelete
                  deleting={deletingId === thread.id}
                  onClick={() => onSelectPost(galleryThread)}
                  onDelete={() => void handleDelete(thread.id)}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
