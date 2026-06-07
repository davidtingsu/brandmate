import type {
  BrandProfile,
  HumanFeedbackType,
  PostAttempt,
  PostBrandingOptions,
  PostFormat,
  PostType,
} from "@/lib/types";

export interface GeneratePostInput {
  topic: string;
  brandProfile: BrandProfile;
  attemptNumber?: number;
  format?: PostFormat;
  includeImage?: boolean;
  imageStyle?: string;
  slideCount?: number;
  postType?: PostType;
  imageUrl?: string;
  scoreBefore?: number;
  branding?: PostBrandingOptions;
}

export interface GeneratePostResult {
  attempt: PostAttempt;
  weaveTraceId?: string;
}

export async function saveBrandProfile(
  profile: BrandProfile,
  sessionId: string | null,
  sessionsEnabled: boolean
): Promise<void> {
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
}

export async function generatePost(
  input: GeneratePostInput
): Promise<GeneratePostResult> {
  const res = await fetch("/api/agents/orchestrate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      topic: input.topic,
      brandProfile: input.brandProfile,
      attemptNumber: input.attemptNumber ?? 1,
      postType: input.postType ?? "story",
      format: input.format ?? "text",
      includeImage: input.includeImage ?? false,
      imageStyle: input.imageStyle,
      slideCount: input.slideCount,
      imageUrl: input.imageUrl,
      scoreBefore: input.scoreBefore,
      branding: input.branding,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Failed to create post");
  }
  return res.json() as Promise<GeneratePostResult>;
}

export interface FeedbackLesson {
  lesson: string;
  scoreBefore: number;
  topic: string;
  humanFeedback: HumanFeedbackType;
}

export async function submitHumanFeedback(
  attempt: PostAttempt,
  feedbackType: HumanFeedbackType,
  topic: string
): Promise<FeedbackLesson> {
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

  return {
    lesson: data.lesson as string,
    scoreBefore: data.scoreBefore as number,
    topic,
    humanFeedback: feedbackType,
  };
}

export async function storeLesson(
  profile: BrandProfile,
  topic: string,
  lesson: string,
  scoreBefore: number,
  humanFeedback?: HumanFeedbackType
): Promise<{ lesson: { lesson: string; score_before: number } }> {
  const res = await fetch("/api/memory/store", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      traced: true,
      task: topic,
      niche: profile.niche,
      lesson,
      score_before: scoreBefore,
      human_feedback: humanFeedback,
    }),
  });
  if (!res.ok) throw new Error("Failed to store lesson");
  return res.json();
}

export async function updatePostTitle(
  sessionId: string,
  title: string
): Promise<void> {
  await fetch(`/api/sessions/${sessionId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
}
