"use client";

import { ApprovePostCard } from "@/components/generative/ApprovePostCard";
import { AttemptCard } from "@/components/generative/AttemptCard";
import { BrandProfileCard } from "@/components/generative/BrandProfileCard";
import { HumanFeedbackButtons } from "@/components/generative/HumanFeedbackButtons";
import { JudgeBreakdown } from "@/components/generative/JudgeBreakdown";
import { LessonCard } from "@/components/generative/LessonCard";
import { MemoryListCard } from "@/components/generative/MemoryListCard";
import { PostCard } from "@/components/generative/PostCard";
import { useBrandProfile } from "@/contexts/BrandProfileContext";
import { useChatSessionContext } from "@/contexts/ChatSessionContext";
import { useSessionLoader } from "@/hooks/useSessionLoader";
import type {
  BrandProfile,
  HumanFeedbackType,
  PostAttempt,
  PostBrandingOptions,
  PostFormat,
  PostType,
} from "@/lib/types";
import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { useRouter } from "next/navigation";
import { useCallback, useRef } from "react";

export function usePostActions() {
  const router = useRouter();
  const { brandProfile, setBrandProfile } = useBrandProfile();
  const { persistAttempt, sessionsEnabled } = useChatSessionContext();
  const { ensureSession } = useSessionLoader();

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
        }
      : null,
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
      if (!sessionId || !sessionsEnabled) return;
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
    [ensureSession, sessionsEnabled]
  );

  const persistApprovedPost = useCallback(
    async (attempt: PostAttempt, variantIndex = 0) => {
      const sessionId = await ensureSession();
      if (!sessionId || !sessionsEnabled) return;
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
    [ensureSession, sessionsEnabled]
  );

  const handlePreviewInFeed = useCallback(async () => {
    const attempt = lastAttemptRef.current;
    if (!attempt) return;
    const sessionId = await persistApprovedPost(attempt);
    if (sessionId) {
      router.push(`/preview/${sessionId}`);
    }
  }, [persistApprovedPost, router]);

  const renderAttemptCards = (
    attempt: PostAttempt,
    weaveTraceId?: string,
    showFeedback = true
  ) => (
    <>
      <MemoryListCard lessons={attempt.retrievedMemories} topic={attempt.topic} />
      <PostCard
        variants={attempt.variants}
        brandProfile={brandProfile}
        topic={attempt.topic}
        branding={attempt.branding ?? lastBrandingRef.current}
      />
      <JudgeBreakdown breakdown={attempt.breakdown} score={attempt.judgeScore} />
      <AttemptCard attempt={attempt} weaveProject={weaveTraceId} />
      {showFeedback && (
        <>
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
          <ApprovePostCard onPreview={() => void handlePreviewInFeed()} />
        </>
      )}
    </>
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
      "Generate a LinkedIn post. Formats: text, text with image (includeImage), or carousel (slideCount 5-10).",
    parameters: [
      { name: "topic", type: "string", description: "Post topic", required: true },
      {
        name: "format",
        type: "string",
        description: "text | carousel",
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
    handler: async ({
      topic,
      format,
      includeImage,
      imageStyle,
      slideCount,
      postType,
      imageUrl,
      includeHandle,
      includeProfileImage,
    }) => {
      const profile = ensureProfile();
      const postFormat = (format as PostFormat) ?? "text";
      lastFormatRef.current = postFormat;

      const branding: PostBrandingOptions | undefined =
        includeHandle !== undefined || includeProfileImage !== undefined
          ? {
              includeHandle: includeHandle ?? false,
              includeProfileImage: includeProfileImage ?? false,
            }
          : lastBrandingRef.current;

      lastBrandingRef.current = branding;

      const res = await fetch("/api/agents/orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          brandProfile: profile,
          attemptNumber: attemptCounterRef.current,
          postType: (postType as PostType) ?? "story",
          format: postFormat,
          includeImage: includeImage ?? false,
          imageStyle,
          slideCount,
          imageUrl,
          branding,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to create post");
      }
      const data = await res.json();
      const attempt = {
        ...(data.attempt as PostAttempt),
        branding: branding ?? (data.attempt as PostAttempt).branding,
      };
      lastAttemptRef.current = attempt;
      const sessionId = await ensureSession();
      await persistAttempt(
        {
          attempt,
          weaveTraceId: data.weaveTraceId,
        },
        sessionId ?? undefined
      );
      return { ...data, attempt };
    },
    render: ({ status, result }) => {
      if (status === "inProgress") {
        const fmt = lastFormatRef.current;
        return (
          <div className="my-2 text-sm text-slate-500">
            {fmt === "carousel"
              ? "Generating carousel, searching memories, judging draft..."
              : "Generating post, searching memories, judging draft..."}
          </div>
        );
      }
      if (status !== "complete" || !result?.attempt) return <></>;
      const attempt = result.attempt as PostAttempt;
      return renderAttemptCards(
        attempt,
        result.weaveTraceId as string | undefined
      );
    },
  });

  useCopilotAction({
    name: "approvePost",
    description:
      "Mark the latest draft as approved and open the LinkedIn feed preview",
    parameters: [
      {
        name: "variantIndex",
        type: "number",
        description: "0 for variant A, 1 for variant B",
        required: false,
      },
    ],
    handler: async ({ variantIndex }) => {
      const attempt = lastAttemptRef.current;
      if (!attempt) throw new Error("No post to approve");
      const sessionId = await persistApprovedPost(attempt, variantIndex ?? 0);
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
        <>
          <LessonCard
            lesson={result.lesson as string}
            scoreBefore={result.scoreBefore as number}
          />
          <ApprovePostCard onPreview={() => void handlePreviewInFeed()} />
        </>
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
        <>
          <LessonCard
            lesson={stored.lesson}
            scoreBefore={stored.score_before}
            approved
          />
          <ApprovePostCard onPreview={() => void handlePreviewInFeed()} />
        </>
      );
    },
  });

  useCopilotAction({
    name: "retryWithLesson",
    description: "Retry post generation using lessons stored in Redis",
    parameters: [
      { name: "topic", type: "string", description: "Post topic to retry", required: true },
      {
        name: "format",
        type: "string",
        description: "text | carousel",
        required: false,
      },
      {
        name: "includeImage",
        type: "boolean",
        description: "Include image on text retry",
        required: false,
      },
      {
        name: "slideCount",
        type: "number",
        description: "Carousel slide count",
        required: false,
      },
      {
        name: "postType",
        type: "string",
        description: "story | insight | lesson | milestone | hot_take",
        required: false,
      },
      {
        name: "includeHandle",
        type: "boolean",
        description: "Overlay handle",
        required: false,
      },
      {
        name: "includeProfileImage",
        type: "boolean",
        description: "Overlay profile photo",
        required: false,
      },
    ],
    handler: async ({
      topic,
      format,
      includeImage,
      slideCount,
      postType,
      includeHandle,
      includeProfileImage,
    }) => {
      const profile = ensureProfile();
      const scoreBefore = lastAttemptRef.current?.judgeScore;
      const postFormat =
        (format as PostFormat) ??
        lastAttemptRef.current?.variants[0]?.format ??
        "text";
      lastFormatRef.current = postFormat;
      attemptCounterRef.current += 1;

      const branding: PostBrandingOptions | undefined =
        includeHandle !== undefined || includeProfileImage !== undefined
          ? {
              includeHandle: includeHandle ?? false,
              includeProfileImage: includeProfileImage ?? false,
            }
          : lastBrandingRef.current;
      lastBrandingRef.current = branding;

      const res = await fetch("/api/agents/orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          brandProfile: profile,
          attemptNumber: attemptCounterRef.current,
          postType: (postType as PostType) ?? "story",
          format: postFormat,
          includeImage,
          slideCount,
          scoreBefore,
          branding,
        }),
      });
      if (!res.ok) throw new Error("Retry failed");
      const data = await res.json();
      const attempt = {
        ...(data.attempt as PostAttempt),
        branding: branding ?? (data.attempt as PostAttempt).branding,
      };
      lastAttemptRef.current = attempt;
      const sessionId = await ensureSession();
      await persistAttempt(
        {
          attempt,
          weaveTraceId: data.weaveTraceId,
        },
        sessionId ?? undefined
      );
      return { ...data, attempt };
    },
    render: ({ status, result }) => {
      if (status === "inProgress") {
        return (
          <div className="text-sm text-slate-500">
            Retrying with learned lessons from Redis...
          </div>
        );
      }
      if (status !== "complete" || !result?.attempt) return <></>;
      const attempt = result.attempt as PostAttempt;
      return renderAttemptCards(
        attempt,
        result.weaveTraceId as string | undefined,
        false
      );
    },
  });

  useCopilotAction({
    name: "copyPost",
    description: "Copy the latest generated LinkedIn post text to clipboard",
    parameters: [
      { name: "variantIndex", type: "number", description: "0 for A, 1 for B", required: false },
    ],
    handler: async ({ variantIndex }) => {
      const attempt = lastAttemptRef.current;
      if (!attempt?.variants?.length) throw new Error("No post to copy");
      const idx = variantIndex ?? 0;
      const post = attempt.variants[idx] ?? attempt.variants[0];
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
}
