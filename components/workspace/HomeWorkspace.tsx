"use client";

import { ProfileForm } from "@/components/forms/ProfileForm";
import { AttemptCard } from "@/components/generative/AttemptCard";
import { JudgeBreakdown } from "@/components/generative/JudgeBreakdown";
import { PostCard } from "@/components/generative/PostCard";
import { PostsGallery } from "@/components/posts/PostsGallery";
import { useBrandMateWorkflow } from "@/hooks/useBrandMateWorkflow";
import type { BrandProfile, ChatThread } from "@/lib/types";

interface HomeWorkspaceProps {
  brandProfile: BrandProfile;
  onSelectPost: (thread: ChatThread) => void;
}

export function HomeWorkspace({
  brandProfile,
  onSelectPost,
}: HomeWorkspaceProps) {
  const workflow = useBrandMateWorkflow();
  const hasProfile = Boolean(brandProfile.name && brandProfile.niche);
  const post = workflow.selectedPost;

  if (!post) {
    return (
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
        <div className="mx-auto w-full max-w-5xl space-y-8">
          {!hasProfile ? (
            <div className="mx-auto max-w-2xl space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-slate-900">
                  Welcome to BrandMate
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Set up your profile, then create LinkedIn posts with structured
                  forms—not free-text chat.
                </p>
              </div>
              <ProfileForm
                initial={brandProfile}
                onSubmit={workflow.createProfile}
              />
            </div>
          ) : (
            <PostsGallery
              onNewPost={() => void workflow.startNewPost()}
              onSelectPost={onSelectPost}
            />
          )}
        </div>
      </div>
    );
  }

  const { attempt, weaveTraceId } = post;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={() => workflow.setSelectedPost(null)}
              className="mb-2 text-sm font-medium text-linkedin hover:text-blue-700"
            >
              ← All posts
            </button>
            <h2 className="text-lg font-semibold text-slate-900">
              {attempt.topic}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Attempt #{attempt.attemptNumber} · Judge score{" "}
              <span className="font-medium text-slate-700">
                {attempt.judgeScore}/10
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => void workflow.startNewPost()}
            className="rounded-lg bg-linkedin px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + New post
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-3xl space-y-4">
          <PostCard
            variants={attempt.variants}
            brandProfile={brandProfile}
            topic={attempt.topic}
            branding={attempt.branding}
          />
          <JudgeBreakdown
            breakdown={attempt.breakdown}
            score={attempt.judgeScore}
          />
          <AttemptCard attempt={attempt} weaveProject={weaveTraceId} />
        </div>
      </div>
    </div>
  );
}
