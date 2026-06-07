"use client";

import { PostGeneratingPreview } from "@/components/create/PostGeneratingPreview";
import { ApprovePostCard } from "@/components/generative/ApprovePostCard";
import { AttemptCard } from "@/components/generative/AttemptCard";
import { BrandProfileCard } from "@/components/generative/BrandProfileCard";
import { HumanFeedbackButtons } from "@/components/generative/HumanFeedbackButtons";
import { JudgeBreakdown } from "@/components/generative/JudgeBreakdown";
import { LessonCard } from "@/components/generative/LessonCard";
import { PostCard } from "@/components/generative/PostCard";
import { useBrandProfile } from "@/contexts/BrandProfileContext";
import { useDiagramAgent } from "@/hooks/useDiagramAgent";
import { useChatSessionContext } from "@/contexts/ChatSessionContext";
import { useCreateFlow } from "@/contexts/CreateFlowContext";
import { useSessionLoader } from "@/hooks/useSessionLoader";
import type {
  BrandProfile,
  HumanFeedbackType,
  PostAttempt,
  PostBrandingOptions,
  PostFormat,
  PostType,
} from "@/lib/types";
import { isAttemptMediaComplete } from "@/lib/attempt-media-complete";
import { updatePostTitle } from "@/lib/brandmate/actions";
import type { GenerationPreview } from "@/lib/generation-estimates";
import { summarizePostTitle } from "@/lib/sessions/summarize-title";
import { useCarouselRender } from "@/hooks/useCarouselRender";
import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { deriveGenerateParamsFromAttempt } from "@/lib/create-flow/derive-generate-values";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export type { GeneratePostParams } from "@/lib/create-flow/generate-params";
import type { GeneratePostParams } from "@/lib/create-flow/generate-params";

function formatJudgeRevisionContext(attempt: PostAttempt): string {
  const lines: string[] = [`Prior judge score: ${attempt.judgeScore}/10`];

  if (attempt.scoreBefore !== undefined) {
    lines.push(`Score before retry: ${attempt.scoreBefore}/10`);
  }
  if (attempt.problems.length > 0) {
    lines.push(
      `Problems:\n${attempt.problems.map((problem) => `- ${problem}`).join("\n")}`
    );
  }
  const breakdown = attempt.breakdown;
  lines.push(
    `Breakdown: hook_strength=${breakdown.hook_strength}, voice_authenticity=${breakdown.voice_authenticity}, audience_fit=${breakdown.audience_fit}, engagement_potential=${breakdown.engagement_potential}, brand_alignment=${breakdown.brand_alignment}`
  );
  if (attempt.judgeFeedback) {
    lines.push(`Judge feedback: ${attempt.judgeFeedback}`);
  }

  return lines.join("\n");
}

export interface RenderAttemptCardsOptions {
  showFeedback?: boolean;
  showPreviewCta?: boolean;
}

export function usePostActions() {
  const {
    carouselRenderState,
    streamRender,
    resetCarouselRender,
  } = useCarouselRender();
  const router = useRouter();
  const { brandProfile, setBrandProfile } = useBrandProfile();
  const { persistAttempt, setThreads } = useChatSessionContext();
  const { ensureSession, loadSessions } = useSessionLoader();
  const { lastAttempt, setLastAttempt } = useCreateFlow();

  const lastAttemptRef = useRef<PostAttempt | null>(null);
  const lastBrandingRef = useRef<PostBrandingOptions | undefined>(undefined);
  const pendingLessonRef = useRef<{
    lesson: string;
    scoreBefore: number;
    topic: string;
    humanFeedback: HumanFeedbackType;
  } | null>(null);
  const attemptCounterRef = useRef(1);
  const lastFormatRef = useRef<PostFormat>("text");
  const lastPortraitImageUrlRef = useRef<string | undefined>(undefined);
  const lastGenerateParamsRef = useRef<GeneratePostParams | null>(null);
  const [generationPreview, setGenerationPreview] =
    useState<GenerationPreview | null>(null);

  useDiagramAgent({
    getActiveFormat: () => lastFormatRef.current,
  });

  useEffect(() => {
    if (lastAttempt) {
      lastAttemptRef.current = lastAttempt;
      attemptCounterRef.current = lastAttempt.attemptNumber;
      if (lastAttempt.branding) {
        lastBrandingRef.current = lastAttempt.branding;
      }
      const format = lastAttempt.variants[0]?.format;
      if (format) lastFormatRef.current = format;
      if (!lastGenerateParamsRef.current) {
        lastGenerateParamsRef.current =
          deriveGenerateParamsFromAttempt(lastAttempt);
      }
    }
  }, [lastAttempt]);

  useCopilotReadable({
    description: "User's LinkedIn personal brand profile",
    value: brandProfile,
  });

  useCopilotReadable({
    description: "Last generated post attempt summary",
    value: lastAttemptRef.current
      ? {
          topic: lastAttemptRef.current.topic,
          score: lastAttemptRef.current.judgeScore,
          format: lastAttemptRef.current.variants[0]?.format,
          postType: lastAttemptRef.current.variants[0]?.postType,
          problems: lastAttemptRef.current.problems,
          breakdown: lastAttemptRef.current.breakdown,
          judgeFeedback: lastAttemptRef.current.judgeFeedback,
        }
      : null,
  });

  useCopilotReadable({
    description:
      "Active post format for this studio session. When carousel, never generate system diagrams.",
    value: lastFormatRef.current,
  });

  const ensureProfile = useCallback(() => {
    if (!brandProfile.name || !brandProfile.niche) {
      throw new Error(
        "Set your brand profile first. Tell me your name, niche, audience, and voice."
      );
    }
    return brandProfile;
  }, [brandProfile]);

  const persistProfile = useCallback(
    async (profile: BrandProfile) => {
      const sessionId = await ensureSession();
      if (!sessionId) return;
      await fetch(`/api/sessions/${sessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "assistant",
          content: null,
          metadata: { type: "brand_profile", profile },
        }),
      });
    },
    [ensureSession]
  );

  const persistApprovedPost = useCallback(
    async (attempt: PostAttempt, variantIndex = 0) => {
      const sessionId = await ensureSession();
      if (!sessionId) return;
      await fetch(`/api/sessions/${sessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "assistant",
          content: null,
          metadata: {
            type: "approved_post",
            attempt,
            variantIndex,
            branding: lastBrandingRef.current ?? attempt.branding,
            approvedAt: new Date().toISOString(),
          },
        }),
      });
      return sessionId;
    },
    [ensureSession]
  );

  const handlePreviewInFeed = useCallback(async () => {
    const attempt = lastAttemptRef.current;
    if (!attempt) return;
    const sessionId = await persistApprovedPost(attempt);
    if (sessionId) {
      router.push(`/preview/${sessionId}`);
    }
  }, [persistApprovedPost, router]);

  const renderAttemptCards = useCallback(
    (
      attempt: PostAttempt,
      weaveTraceId?: string,
      options: RenderAttemptCardsOptions = {}
    ) => {
      const { showFeedback = true, showPreviewCta = false } = options;
      return (
        <>
          <PostCard
            variants={attempt.variants}
            brandProfile={brandProfile}
            topic={attempt.topic}
            branding={attempt.branding ?? lastBrandingRef.current}
          />
          {isAttemptMediaComplete(attempt) && (
            <>
              <JudgeBreakdown
                breakdown={attempt.breakdown}
                score={attempt.judgeScore}
              />
              <AttemptCard attempt={attempt} weaveProject={weaveTraceId} />
              {showFeedback && attempt.variants[0]?.format !== "diagram" && (
                <HumanFeedbackButtons
                  onSelect={async (feedback) => {
                    await fetch("/api/agents/memory", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        action: "feedback",
                        feedbackType: feedback,
                        scoreBefore: attempt.judgeScore,
                        traceId: attempt.weaveTraceId,
                      }),
                    });
                  }}
                />
              )}
            </>
          )}
          {showPreviewCta && (
            <ApprovePostCard onPreview={() => void handlePreviewInFeed()} />
          )}
        </>
      );
    },
    [brandProfile, handlePreviewInFeed]
  );

  const renderGenerationPreview = useCallback(() => {
    if (!generationPreview?.active) return null;
    return (
      <PostGeneratingPreview
        preview={generationPreview}
        brandProfile={brandProfile}
        lastAttempt={lastAttemptRef.current ?? lastAttempt}
        branding={lastBrandingRef.current}
      />
    );
  }, [brandProfile, generationPreview, lastAttempt]);

  const runOrchestrate = useCallback(
    async (params: GeneratePostParams & { isRetry?: boolean }) => {
      const profile = ensureProfile();
      const postFormat = (params.format as PostFormat) ?? "text";
      lastFormatRef.current = postFormat;

      setGenerationPreview({
        active: true,
        topic: params.topic,
        format: postFormat,
        includeImage: Boolean(params.includeImage),
        slideCount: params.slideCount ?? 7,
        startedAt: Date.now(),
        phase: "orchestrating",
      });

      const branding: PostBrandingOptions | undefined =
        params.branding ??
        (params.includeHandle !== undefined ||
        params.includeProfileImage !== undefined
          ? {
              includeHandle: params.includeHandle ?? false,
              includeProfileImage: params.includeProfileImage ?? false,
            }
          : lastBrandingRef.current);

      lastBrandingRef.current = branding;

      if (params.isRetry) {
        attemptCounterRef.current += 1;
      }

      if (postFormat === "carousel") {
        resetCarouselRender();
      }

      const portraitImageUrl =
        params.portraitImageUrl ??
        (postFormat === "carousel" ? lastPortraitImageUrlRef.current : undefined) ??
        profile.profileImageUrl;

      if (portraitImageUrl && postFormat === "carousel") {
        lastPortraitImageUrlRef.current = portraitImageUrl;
      }

      try {
      const res = await fetch("/api/agents/orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: params.topic,
          brandProfile: profile,
          attemptNumber: attemptCounterRef.current,
          postType: params.postType ?? "story",
          format: postFormat,
          includeImage: params.includeImage ?? false,
          imageStyle: params.imageStyle,
          slideCount: params.slideCount,
          imageUrl: params.imageUrl,
          portraitImageUrl,
          branding,
          scoreBefore:
            params.scoreBefore ??
            (params.isRetry ? lastAttemptRef.current?.judgeScore : undefined),
          userFeedback: params.userFeedback,
          judgeRevisionContext: params.judgeRevisionContext,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to create post");
      }
      const data = await res.json();
      let attempt = {
        ...(data.attempt as PostAttempt),
        branding: branding ?? (data.attempt as PostAttempt).branding,
      };

      lastAttemptRef.current = attempt;
      setLastAttempt(attempt, data.weaveTraceId as string | undefined);

      if (
        postFormat === "carousel" &&
        attempt.variants[0]?.slides?.length
      ) {
        setGenerationPreview((prev) =>
          prev ? { ...prev, phase: "rendering" } : prev
        );
        const pendingSlides = attempt.variants[0].slides!.map((slide) => ({
          ...slide,
          imageUrl: undefined,
          pngStatus: "pending" as const,
        }));
        attempt = {
          ...attempt,
          variants: attempt.variants.map((v, i) =>
            i === 0 ? { ...v, slides: pendingSlides } : v
          ),
        };
        lastAttemptRef.current = attempt;
        setLastAttempt(attempt, data.weaveTraceId as string | undefined);

        const renderedSlides = await streamRender({
          slides: pendingSlides,
          portraitImageUrl,
          topic: params.topic,
          brandProfile: profile,
          branding,
          onSlidesUpdate: (slides) => {
            const updated = {
              ...attempt,
              variants: attempt.variants.map((v, i) =>
                i === 0 ? { ...v, slides } : v
              ),
            };
            attempt = updated;
            lastAttemptRef.current = updated;
            setLastAttempt(updated, data.weaveTraceId as string | undefined);
          },
        });
        attempt = {
          ...attempt,
          variants: attempt.variants.map((v, i) =>
            i === 0 ? { ...v, slides: renderedSlides } : v
          ),
        };
      }

      lastAttemptRef.current = attempt;
      setLastAttempt(attempt, data.weaveTraceId as string | undefined);
      await persistProfile(profile);
      const sessionId = await ensureSession();
      if (!sessionId) {
        throw new Error(
          "Post generated but could not be saved to your gallery. Retry or check Supabase connection."
        );
      }
      const persistResult = await persistAttempt(
        {
          attempt,
          weaveTraceId: data.weaveTraceId,
        },
        sessionId
      );
      if (!persistResult?.messageId) {
        throw new Error(
          "Post generated but could not be saved to your gallery. Retry or check Supabase connection."
        );
      }

      void fetch("/api/memory/posts/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          attemptNumber: attempt.attemptNumber,
          messageId: persistResult.messageId,
        }),
      }).catch(() => undefined);

      const title = summarizePostTitle(params.topic);
      await updatePostTitle(sessionId, title);
      setThreads((prev) => {
        const exists = prev.some((t) => t.id === sessionId);
        if (!exists) return prev;
        return prev.map((t) =>
          t.id === sessionId ? { ...t, title, displayTitle: title } : t
        );
      });
      await loadSessions({ silent: true });

      lastGenerateParamsRef.current = {
        topic: params.topic,
        format: postFormat,
        includeImage: params.includeImage,
        imageStyle: params.imageStyle,
        slideCount: params.slideCount,
        postType: params.postType ?? attempt.variants[0]?.postType ?? "story",
        imageUrl: params.imageUrl,
        portraitImageUrl,
        branding,
        includeHandle: branding?.includeHandle,
        includeProfileImage: branding?.includeProfileImage,
      };

      return { ...data, attempt, weaveTraceId: data.weaveTraceId as string };
      } finally {
        setGenerationPreview(null);
      }
    },
    [
      ensureProfile,
      ensureSession,
      loadSessions,
      persistProfile,
      persistAttempt,
      setLastAttempt,
      setThreads,
      streamRender,
      resetCarouselRender,
    ]
  );

  const generatePost = useCallback(
    async (params: GeneratePostParams) => runOrchestrate(params),
    [runOrchestrate]
  );

  useCopilotAction({
    name: "setBrandProfile",
    description:
      "Set or update the user's LinkedIn personal brand profile",
    parameters: [
      { name: "name", type: "string", description: "User's name", required: true },
      { name: "niche", type: "string", description: "Professional niche", required: true },
      { name: "audience", type: "string", description: "Target audience", required: true },
      { name: "voice", type: "string", description: "Writing voice style", required: true },
      { name: "goals", type: "string", description: "Brand goals", required: false },
      { name: "handle", type: "string", description: "LinkedIn handle", required: false },
      {
        name: "profileImageUrl",
        type: "string",
        description: "Profile image URL",
        required: false,
      },
    ],
    handler: async ({
      name,
      niche,
      audience,
      voice,
      goals,
      handle,
      profileImageUrl,
    }) => {
      const profile: BrandProfile = {
        name,
        niche,
        audience,
        voice,
        goals,
        handle,
        profileImageUrl,
      };
      setBrandProfile(profile);
      await persistProfile(profile);
      return { success: true, profile };
    },
    render: ({ result }) => {
      if (!result?.profile) return <></>;
      return <BrandProfileCard profile={result.profile as BrandProfile} />;
    },
  });

  useCopilotAction({
    name: "createPost",
    description:
      "Generate a LinkedIn post. Formats: text, text with image (includeImage), diagram (system diagram infographic), or carousel (slideCount 5-10).",
    parameters: [
      { name: "topic", type: "string", description: "Post topic", required: true },
      {
        name: "format",
        type: "string",
        description: "text | diagram | carousel",
        required: false,
      },
      {
        name: "includeImage",
        type: "boolean",
        description: "Attach image to text post",
        required: false,
      },
      {
        name: "imageStyle",
        type: "string",
        description: "Optional image prompt hint",
        required: false,
      },
      {
        name: "slideCount",
        type: "number",
        description: "Slides for carousel (5-10)",
        required: false,
      },
      {
        name: "postType",
        type: "string",
        description: "story | insight | lesson | milestone | hot_take",
        required: false,
      },
      {
        name: "imageUrl",
        type: "string",
        description: "Uploaded image URL",
        required: false,
      },
      {
        name: "includeHandle",
        type: "boolean",
        description: "Overlay handle on carousel/image",
        required: false,
      },
      {
        name: "includeProfileImage",
        type: "boolean",
        description: "Overlay profile photo on carousel/image",
        required: false,
      },
    ],
    handler: async (params) => {
      return generatePost({
        topic: params.topic,
        format: (params.format as PostFormat) ?? "text",
        includeImage: params.includeImage,
        imageStyle: params.imageStyle,
        slideCount: params.slideCount,
        postType: (params.postType as PostType) ?? "story",
        imageUrl: params.imageUrl,
        includeHandle: params.includeHandle,
        includeProfileImage: params.includeProfileImage,
      });
    },
    render: ({ status, result }) => {
      if (status === "inProgress") {
        const preview = renderGenerationPreview();
        if (preview) return <div className="my-2">{preview}</div>;
        return (
          <div className="my-2 text-sm text-slate-500">Generating post…</div>
        );
      }
      if (status !== "complete" || !result?.attempt) return <></>;
      const attempt = result.attempt as PostAttempt;
      return renderAttemptCards(
        attempt,
        result.weaveTraceId as string | undefined,
        { showFeedback: false, showPreviewCta: false }
      );
    },
  });

  useCopilotAction({
    name: "approvePost",
    description:
      "Step 3 only: mark the latest draft as approved and open the LinkedIn feed preview",
    parameters: [],
    handler: async () => {
      const attempt = lastAttemptRef.current;
      if (!attempt) throw new Error("No post to approve");
      const sessionId = await persistApprovedPost(attempt, 0);
      return { sessionId, approved: true };
    },
    render: ({ status }) => {
      if (status === "inProgress") {
        return <div className="text-sm text-slate-500">Saving approval…</div>;
      }
      return (
        <ApprovePostCard onPreview={() => void handlePreviewInFeed()} />
      );
    },
  });

  useCopilotAction({
    name: "submitHumanFeedback",
    description:
      "Process human feedback on a post draft and summarize a lesson to learn",
    parameters: [
      {
        name: "feedbackType",
        type: "string",
        description: "too_generic | too_long | on_brand | good",
        required: true,
      },
      { name: "topic", type: "string", description: "Post topic", required: true },
    ],
    handler: async ({ feedbackType, topic }) => {
      const attempt = lastAttemptRef.current;
      if (!attempt) throw new Error("No post attempt to give feedback on");

      const res = await fetch("/api/agents/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "summarize",
          topic,
          judgeFeedback: attempt.problems.join("; "),
          humanFeedback: feedbackType,
          problems: attempt.problems,
          scoreBefore: attempt.judgeScore,
        }),
      });
      if (!res.ok) throw new Error("Failed to summarize lesson");
      const data = await res.json();

      await fetch("/api/agents/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "feedback",
          feedbackType,
          scoreBefore: attempt.judgeScore,
        }),
      });

      pendingLessonRef.current = {
        lesson: data.lesson,
        scoreBefore: data.scoreBefore,
        topic,
        humanFeedback: feedbackType as HumanFeedbackType,
      };

      return { ...data, topic, feedbackType };
    },
    render: ({ status, result }) => {
      if (status === "inProgress") {
        return <div className="text-sm text-slate-500">Summarizing lesson...</div>;
      }
      if (status !== "complete" || !result?.lesson) return <></>;
      return (
        <LessonCard
          lesson={result.lesson as string}
          scoreBefore={result.scoreBefore as number}
        />
      );
    },
  });

  useCopilotAction({
    name: "storeLesson",
    description: "Approve and store the learned lesson in Redis vector memory",
    parameters: [
      { name: "topic", type: "string", description: "Original post topic", required: true },
      { name: "lesson", type: "string", description: "Lesson text to store", required: false },
    ],
    handler: async ({ topic, lesson }) => {
      const profile = ensureProfile();
      const pending = pendingLessonRef.current;
      const lessonText = lesson ?? pending?.lesson;
      const scoreBefore = pending?.scoreBefore ?? lastAttemptRef.current?.judgeScore ?? 5;

      if (!lessonText) throw new Error("No lesson to store");

      const res = await fetch("/api/memory/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          traced: true,
          task: topic,
          niche: profile.niche,
          lesson: lessonText,
          score_before: scoreBefore,
          human_feedback: pending?.humanFeedback,
        }),
      });
      if (!res.ok) throw new Error("Failed to store lesson");
      const data = await res.json();
      pendingLessonRef.current = null;
      return data;
    },
    render: ({ status, result }) => {
      if (status !== "complete" || !result?.lesson) return <></>;
      const stored = result.lesson as { lesson: string; score_before: number };
      return (
        <LessonCard
          lesson={stored.lesson}
          scoreBefore={stored.score_before}
          approved
        />
      );
    },
  });

  useCopilotAction({
    name: "retryWithJudgeFeedback",
    description:
      "Retry post generation using judge breakdown, problems, and feedback on the latest draft",
    parameters: [
      { name: "topic", type: "string", description: "Post topic to retry", required: true },
      {
        name: "userFeedback",
        type: "string",
        description: "Optional extra revision instructions from the user chat",
        required: false,
      },
    ],
    handler: async ({ topic, userFeedback }) => {
      const attempt = lastAttemptRef.current;
      if (!attempt) throw new Error("No post attempt to retry");

      const lastParams = lastGenerateParamsRef.current;
      return runOrchestrate({
        topic,
        format:
          lastParams?.format ??
          attempt.variants[0]?.format ??
          "text",
        includeImage: lastParams?.includeImage,
        imageStyle: lastParams?.imageStyle,
        slideCount: lastParams?.slideCount,
        postType:
          lastParams?.postType ?? attempt.variants[0]?.postType ?? "story",
        imageUrl: lastParams?.imageUrl,
        portraitImageUrl: lastParams?.portraitImageUrl,
        branding: lastParams?.branding,
        includeHandle: lastParams?.includeHandle,
        includeProfileImage: lastParams?.includeProfileImage,
        isRetry: true,
        scoreBefore: attempt.judgeScore,
        judgeRevisionContext: formatJudgeRevisionContext(attempt),
        userFeedback,
      });
    },
    render: ({ status, result }) => {
      if (status === "inProgress") {
        const preview = renderGenerationPreview();
        if (preview) return <div className="my-2">{preview}</div>;
        return (
          <div className="text-sm text-slate-500">
            Retrying with judge feedback...
          </div>
        );
      }
      if (status !== "complete" || !result?.attempt) return <></>;
      const attempt = result.attempt as PostAttempt;
      return renderAttemptCards(
        attempt,
        result.weaveTraceId as string | undefined,
        { showFeedback: false, showPreviewCta: false }
      );
    },
  });

  useCopilotAction({
    name: "regeneratePost",
    description:
      "Regenerate the post with the same format and post type as the latest draft",
    parameters: [
      {
        name: "userFeedback",
        type: "string",
        description: "Optional revision instructions from the user chat",
        required: false,
      },
    ],
    handler: async ({ userFeedback }) => {
      const lastParams = lastGenerateParamsRef.current;
      if (!lastParams) {
        throw new Error("No prior generation to regenerate — generate a post first");
      }

      return runOrchestrate({
        ...lastParams,
        isRetry: true,
        userFeedback,
      });
    },
    render: ({ status, result }) => {
      if (status === "inProgress") {
        const preview = renderGenerationPreview();
        if (preview) return <div className="my-2">{preview}</div>;
        return (
          <div className="text-sm text-slate-500">Regenerating post...</div>
        );
      }
      if (status !== "complete" || !result?.attempt) return <></>;
      const attempt = result.attempt as PostAttempt;
      return renderAttemptCards(
        attempt,
        result.weaveTraceId as string | undefined,
        { showFeedback: false, showPreviewCta: false }
      );
    },
  });

  useCopilotAction({
    name: "copyPost",
    description: "Copy the latest generated LinkedIn post text to clipboard",
    parameters: [],
    handler: async () => {
      const attempt = lastAttemptRef.current;
      if (!attempt?.variants?.length) throw new Error("No post to copy");
      const post = attempt.variants[0];
      const { formatPostForDisplay } = await import("@/lib/linkedin-format");
      const text = formatPostForDisplay(post);
      await navigator.clipboard.writeText(text);
      return { copied: true, characterCount: post.characterCount };
    },
    render: ({ status, result }) => {
      if (status !== "complete") return <></>;
      return (
        <div className="my-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
          Copied to clipboard ({result?.characterCount as number} chars)
        </div>
      );
    },
  });

  return {
    generatePost,
    persistProfile,
    renderAttemptCards,
    handlePreviewInFeed,
    carouselRenderState,
    generationPreview,
  };
}
