"use client";

import type { GeneratePostValues } from "@/components/forms/GeneratePostForm";
import { GeneratePostForm } from "@/components/forms/GeneratePostForm";
import { ProfileForm } from "@/components/forms/ProfileForm";
import { ApprovePostCard } from "@/components/generative/ApprovePostCard";
import { PostCard } from "@/components/generative/PostCard";
import { useBrandProfile } from "@/contexts/BrandProfileContext";
import { useCreateFlow } from "@/contexts/CreateFlowContext";
import type { usePostActions } from "@/hooks/usePostActions";
import { useSessionLoader } from "@/hooks/useSessionLoader";
import type { BrandProfile } from "@/lib/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type PostActions = ReturnType<typeof usePostActions>;

const INTRO_COPY = {
  brand: "First, tell me about your brand.",
  post: "Now let's create your LinkedIn post.",
  preview: "Here's your draft in the feed.",
} as const;

function AssistantBubble({
  children,
  intro,
}: {
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 space-y-3">
      <div className="flex gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linkedin text-xs font-bold text-white">
          B
        </div>
        <div className="max-w-[92%] rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3 text-sm text-slate-800">
          {intro}
        </div>
      </div>
      <div className="ml-11">{children}</div>
    </div>
  );
}

interface GuidedStepPanelProps {
  postActions: PostActions;
}

export function GuidedStepPanel({ postActions }: GuidedStepPanelProps) {
  const { brandProfile, setBrandProfile } = useBrandProfile();
  const {
    stage,
    advanceToPost,
    advanceToPreview,
    lastAttempt,
    lastWeaveTraceId,
  } = useCreateFlow();
  const {
    generatePost,
    persistProfile,
    renderAttemptCards,
    handlePreviewInFeed,
  } = postActions;

  const [generating, setGenerating] = useState(false);
  const { ensureSession } = useSessionLoader();
  const router = useRouter();
  const searchParams = useSearchParams();

  const syncSessionUrl = async () => {
    const sessionId = await ensureSession();
    if (sessionId && !searchParams.get("session")) {
      router.replace(`/create?session=${sessionId}`, { scroll: false });
    }
  };

  const handleProfileSubmit = async (profile: BrandProfile) => {
    setBrandProfile(profile);
    await persistProfile(profile);
    await syncSessionUrl();
    advanceToPost();
  };

  const handleGenerateSubmit = async (values: GeneratePostValues) => {
    setGenerating(true);
    try {
      await generatePost(values);
      await syncSessionUrl();
    } finally {
      setGenerating(false);
    }
  };

  if (stage === "brand") {
    return (
      <AssistantBubble intro={INTRO_COPY.brand}>
        <ProfileForm compact initial={brandProfile} onSubmit={handleProfileSubmit} />
      </AssistantBubble>
    );
  }

  if (stage === "post") {
    return (
      <AssistantBubble intro={INTRO_COPY.post}>
        <GeneratePostForm
          hasProfile={Boolean(brandProfile.name && brandProfile.niche)}
          hasHandle={Boolean(brandProfile.handle?.trim())}
          hasProfileImage={Boolean(brandProfile.profileImageUrl)}
          loading={generating}
          onSubmit={handleGenerateSubmit}
        />
        {lastAttempt && (
          <div className="mt-4 space-y-2">
            {renderAttemptCards(lastAttempt, lastWeaveTraceId, {
              showFeedback: true,
              showPreviewCta: false,
            })}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="mb-3 text-sm text-slate-600">
                Ready to see this in the LinkedIn feed?
              </p>
              <button
                type="button"
                onClick={advanceToPreview}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Continue to preview
              </button>
            </div>
          </div>
        )}
      </AssistantBubble>
    );
  }

  if (stage === "preview" && lastAttempt) {
    return (
      <AssistantBubble intro={INTRO_COPY.preview}>
        <PostCard
          variants={lastAttempt.variants}
          brandProfile={brandProfile}
          topic={lastAttempt.topic}
          branding={lastAttempt.branding}
        />
        <ApprovePostCard onPreview={() => void handlePreviewInFeed()} />
      </AssistantBubble>
    );
  }

  return null;
}
