"use client";

import { StructuredComposer } from "@/components/forms/StructuredComposer";
import { PreviewPostBar } from "@/components/workflow/PreviewPostBar";
import { useBrandMateWorkflow } from "@/hooks/useBrandMateWorkflow";
import type { BrandProfile, HumanFeedbackType } from "@/lib/types";
import { useState } from "react";
import { StudioResultsPanel } from "./StudioResultsPanel";

interface PostStudioProps {
  brandProfile: BrandProfile;
}

export function PostStudio({ brandProfile }: PostStudioProps) {
  const workflow = useBrandMateWorkflow();
  const hasProfile = Boolean(brandProfile.name && brandProfile.niche);
  const [selectedFeedback, setSelectedFeedback] = useState<
    HumanFeedbackType | undefined
  >();

  const handleFeedback = async (feedback: HumanFeedbackType) => {
    setSelectedFeedback(feedback);
    await workflow.submitFeedback(feedback);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-slate-200 bg-white px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-900">New post</h2>
        <p className="text-xs text-slate-500">
          Generate a draft, give feedback, then preview in your workspace.
        </p>
        {workflow.error && (
          <p className="mt-2 text-sm text-red-600">{workflow.error}</p>
        )}
      </div>

      <StudioResultsPanel
        phase={workflow.phase}
        attempt={workflow.lastAttempt}
        weaveTraceId={workflow.weaveTraceId}
        pendingLesson={workflow.pendingLesson}
        lessonStored={workflow.lessonStored}
        selectedFeedback={selectedFeedback}
        brandProfile={brandProfile}
        onFeedback={(f) => void handleFeedback(f)}
        onStoreLesson={() => void workflow.approveStoreLesson()}
        onSkipStoreLesson={workflow.skipStoreLesson}
      />

      {workflow.phase === "preview_ready" && (
        <PreviewPostBar onPreview={workflow.openPreview} />
      )}

      <StructuredComposer
        brandProfile={brandProfile}
        hasProfile={hasProfile}
        generating={workflow.phase === "generating"}
        showProfileForm={!hasProfile}
        onCreateProfile={workflow.createProfile}
        onGenerate={workflow.runGenerate}
      />
    </div>
  );
}
