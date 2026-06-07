"use client";

import { BrandHeader } from "@/components/BrandHeader";
import { PostsGallery } from "@/components/posts/PostsGallery";
import { useSessionLoader } from "@/hooks/useSessionLoader";
import { hasApprovedPost } from "@/lib/sessions/approved-post";
import type { ChatThread } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function GalleryHome() {
  const router = useRouter();
  const { loading, loadSessions, loadSession } = useSessionLoader();

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  const handleNewPost = () => {
    router.push("/create");
  };

  const handleSelectPost = (thread: ChatThread) => {
    void (async () => {
      const messages = await loadSession(thread.id);
      if (hasApprovedPost(messages)) {
        router.push(`/preview/${thread.id}`);
      } else {
        router.push(`/create?session=${thread.id}`);
      }
    })();
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Loading…
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col">
      <BrandHeader />
      <div className="brandmate-layout mx-auto w-full max-w-6xl flex-1 p-6">
        <PostsGallery
          onNewPost={handleNewPost}
          onSelectPost={handleSelectPost}
        />
      </div>
    </main>
  );
}
