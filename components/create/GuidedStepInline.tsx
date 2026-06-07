"use client";

import { PostAttemptHistory } from "@/components/create/PostAttemptHistory";
import { PostGeneratingPreview } from "@/components/create/PostGeneratingPreview";
import type { GeneratePostValues } from "@/components/forms/GeneratePostForm";
import { GeneratePostForm } from "@/components/forms/GeneratePostForm";
import { ApprovePostCard } from "@/components/generative/ApprovePostCard";
import { BrandProfileCard } from "@/components/generative/BrandProfileCard";
import { PostCard } from "@/components/generative/PostCard";
import { useBrandProfile } from "@/contexts/BrandProfileContext";
import { useCreateFlow } from "@/contexts/CreateFlowContext";
import { usePostActionsContext } from "@/contexts/PostActionsContext";
import { useSessionLoader } from "@/hooks/useSessionLoader";
import { deriveGenerateValuesFromAttempt } from "@/lib/create-flow/derive-generate-values";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

function InlineCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {children}
    </div>
  );
}

export function GuidedStepInline() {
  const { brandProfile } = useBrandProfile();
  const {
    stage,
    advanceToPreview,
    lastAttempt,
    lastWeaveTraceId,
    attemptHistory,
  } = useCreateFlow();
  const {
    generatePost,
    renderAttemptCards,
    handlePreviewInFeed,
    generationPreview,
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

  const handleGenerateSubmit = async (values: GeneratePostValues) => {
    setGenerating(true);
    try {
      await generatePost(values);
      await syncSessionUrl();
    } finally {
      setGenerating(false);
    }
  };

  const profileComplete = Boolean(brandProfile.name && brandProfile.niche);
  const isGenerating = Boolean(generationPreview?.active);
  const hasExistingDraft = Boolean(lastAttempt?.variants?.length);
  const formInitialValues = useMemo(
    () =>
      lastAttempt ? deriveGenerateValuesFromAttempt(lastAttempt) : undefined,
    [lastAttempt]
  );

  if (stage === "post") {
    return (
      <InlineCard>
        {profileComplete && (
          <div className="mb-4">
            <BrandProfileCard profile={brandProfile} />
          </div>
        )}
        <GeneratePostForm
          hasProfile={profileComplete}
          hasHandle={Boolean(brandProfile.handle?.trim())}
          hasProfileImage={Boolean(brandProfile.profileImageUrl)}
          loading={generating}
          initialValues={isGenerating ? undefined : formInitialValues}
          submitDisabled={hasExistingDraft && !isGenerating}
          readOnly={hasExistingDraft && !isGenerating}
          onSubmit={handleGenerateSubmit}
        />
        {generationPreview?.active && (
          <PostGeneratingPreview
            preview={generationPreview}
            brandProfile={brandProfile}
            lastAttempt={lastAttempt}
            branding={lastAttempt?.branding}
          />
        )}
        {lastAttempt && !isGenerating && (
          <div className="mt-4 space-y-2">
            <PostAttemptHistory
              history={attemptHistory}
              brandProfile={brandProfile}
            />
            {renderAttemptCards(lastAttempt, lastWeaveTraceId, {
              showFeedback: false,
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
