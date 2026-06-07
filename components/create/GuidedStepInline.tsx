"use client";

import type { GeneratePostValues } from "@/components/forms/GeneratePostForm";
import { GeneratePostForm } from "@/components/forms/GeneratePostForm";
import { ProfileForm } from "@/components/forms/ProfileForm";
import { ApprovePostCard } from "@/components/generative/ApprovePostCard";
import { BrandProfileCard } from "@/components/generative/BrandProfileCard";
import { PostCard } from "@/components/generative/PostCard";
import { useBrandProfile } from "@/contexts/BrandProfileContext";
import { useCreateFlow } from "@/contexts/CreateFlowContext";
import { usePostActionsContext } from "@/contexts/PostActionsContext";
import { useSessionLoader } from "@/hooks/useSessionLoader";
import type { BrandProfile } from "@/lib/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

function InlineCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {children}
    </div>
  );
}

export function GuidedStepInline() {
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
  } = usePostActionsContext();

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
      <InlineCard>
        <ProfileForm compact initial={brandProfile} onSubmit={handleProfileSubmit} />
      </InlineCard>
    );
  }

  if (stage === "post") {
    const profileComplete = Boolean(brandProfile.name && brandProfile.niche);

    return (
      <InlineCard>
        {profileComplete && (
          <div className="mb-4">
            <BrandProfileCard profile={brandProfile} />
          </div>
        )}
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
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
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
      </InlineCard>
    );
  }

  if (stage === "preview" && lastAttempt) {
    return (
      <InlineCard>
        <PostCard
          variants={lastAttempt.variants}
          brandProfile={brandProfile}
          topic={lastAttempt.topic}
          branding={lastAttempt.branding}
        />
        <ApprovePostCard onPreview={() => void handlePreviewInFeed()} />
      </InlineCard>
    );
  }

  return null;
}
