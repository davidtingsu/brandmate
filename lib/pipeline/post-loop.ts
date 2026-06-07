import { embedText } from "@/lib/embeddings";
import {
  chatCompletionTokenLimit,
  MAX_LESSONS_IN_PROMPT,
  MAX_TOKENS,
  modelTokenBudget,
} from "@/lib/config";
import { generateSystemDiagram } from "@/lib/agents/diagram-agent";
import { parseModelJson } from "@/lib/parse-model-json";
import { generateCarouselCore } from "@/lib/pipeline/carousel-gen";
import { generateDiagramImage } from "@/lib/pipeline/diagram-image-gen";
import { generatePostImageCore } from "@/lib/pipeline/image-gen";
import { buildRevisionPromptBlocks } from "@/lib/pipeline/revision-prompt";
import { buildLinkedInPost } from "@/lib/linkedin-format";
import { storePost } from "@/lib/redis/post-store";
import { searchMemories } from "@/lib/redis/vector-search";
import { storeLesson as storeLessonInRedis } from "@/lib/redis/lesson-store";
import type {
  GenerateInput,
  GenerateOutput,
  JudgeInput,
  JudgeOutput,
  Lesson,
  LinkedInPost,
  OrchestrateInput,
  OrchestrateOutput,
  PostFormat,
  PostImage,
  PostType,
  SummarizeLessonInput,
  SummarizeLessonOutput,
  SystemDiagram,
} from "@/lib/types";
import { CAROUSEL_MODEL, getOpenAI, MODEL } from "@/lib/weave/openai";

export async function searchMemoriesForTopic({
  query,
  niche,
  postType,
}: {
  query: string;
  niche?: string;
  postType?: PostType;
}): Promise<{ lessons: Lesson[]; query: string }> {
  const embedding = await embedText(query);
  const lessons = await searchMemories({
    queryEmbedding: embedding,
    niche,
    postType,
    limit: MAX_LESSONS_IN_PROMPT,
  });
  return { lessons, query };
}

export async function generatePostCore(
  input: GenerateInput
): Promise<GenerateOutput> {
  const openai = getOpenAI();
  const postType = input.postType ?? "story";
  const format: PostFormat = input.format ?? "text";
  const lessonsText =
    input.lessons.length > 0
      ? input.lessons.map((l, i) => `${i + 1}. ${l.lesson}`).join("\n")
      : "No prior lessons.";

  const revisionContext = buildRevisionPromptBlocks({
    userFeedback: input.userFeedback,
    judgeRevisionContext: input.judgeRevisionContext,
    scoreBefore: input.scoreBefore,
  });

  const response = await openai.chat.completions.create({
    model: MODEL,
    max_tokens: MAX_TOKENS.generate,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You write LinkedIn text posts for personal brand growth. Return JSON: { "variants": [ { "hook", "body", "cta", "hashtags": string[], "postType" } ] } with exactly 1 variant. Post type: ${postType}. Keep under 1300 chars. Apply learned lessons.`,
      },
      {
        role: "user",
        content: `Topic: ${input.topic}
Brand: ${input.brandProfile.name} | Niche: ${input.brandProfile.niche}
Audience: ${input.brandProfile.audience}
Voice: ${input.brandProfile.voice}
Attempt: ${input.attemptNumber}
${revisionContext ? `${revisionContext}\n\n` : ""}Learned lessons:
${lessonsText}`,
      },
    ],
  });

  const raw = parseModelJson<{
    variants: Array<{
      hook: string;
      body: string;
      cta?: string;
      hashtags?: string[];
      postType?: string;
    }>;
  }>(response.choices[0]?.message?.content, { variants: [] });

  const variants = raw.variants.slice(0, 1).map((v) =>
    buildLinkedInPost({
      hook: v.hook,
      body: v.body,
      cta: v.cta,
      hashtags: v.hashtags,
      postType: v.postType ?? postType,
      format,
    })
  );

  return { variants, attemptNumber: input.attemptNumber, postType, format };
}

export async function judgePostCore(input: JudgeInput): Promise<JudgeOutput> {
  const openai = getOpenAI();
  const post = input.post;
  let postText = `${post.hook}\n\n${post.body}\n\n${post.cta}`;

  if (post.format === "carousel" && post.slides?.length) {
    const slideSummary = post.slides
      .map((s) => `${s.index + 1}. ${s.title}: ${s.body}`)
      .join("\n");
    postText += `\n\nCarousel slides:\n${slideSummary}`;
  }

  const imageNote = post.image
    ? "\nNote: This post includes an image attachment."
    : "";

  const judgeModel =
    post.format === "carousel" ? CAROUSEL_MODEL : MODEL;

  const judgeBudget = modelTokenBudget(judgeModel, "judge");

  const response = await openai.chat.completions.create({
    model: judgeModel,
    ...chatCompletionTokenLimit(judgeModel, judgeBudget),
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You judge LinkedIn posts for personal brand growth. Return JSON: { "score": number (1-10), "breakdown": { "hook_strength", "voice_authenticity", "audience_fit", "engagement_potential", "brand_alignment" }, "problems": string[], "feedback": string }. Weights: hook 25%, voice 25%, audience 20%, engagement 15%, brand 15%. For carousels, also consider slide flow and cover hook.`,
      },
      {
        role: "user",
        content: `Topic: ${input.topic}
Format: ${post.format}
Brand voice: ${input.brandProfile.voice}
Audience: ${input.brandProfile.audience}
${imageNote}

Post:
${postText}`,
      },
    ],
  });

  return parseModelJson<JudgeOutput>(
    response.choices[0]?.message?.content,
    {
      score: 5,
      breakdown: {
        hook_strength: 5,
        voice_authenticity: 5,
        audience_fit: 5,
        engagement_potential: 5,
        brand_alignment: 5,
      },
      problems: [],
      feedback: "",
    }
  );
}

async function attachImageToVariants(
  variants: LinkedInPost[],
  input: OrchestrateInput,
  imageUrl?: string
): Promise<LinkedInPost[]> {
  if (variants.length === 0) return variants;

  let image: PostImage | undefined;

  if (imageUrl) {
    image = {
      url: imageUrl,
      alt: `Image for: ${input.topic}`,
      aspectRatio: "1.91:1",
      source: "uploaded",
    };
  } else if (input.includeImage) {
    const primary = variants[0];
    image = await generatePostImageCore({
      topic: input.topic,
      hook: primary.hook,
      body: primary.body,
      brandProfile: input.brandProfile,
      imageStyle: input.imageStyle,
    });
  }

  if (!image) return variants;

  return variants.map((v, i) =>
    i === 0 ? { ...v, image } : v
  );
}

export async function summarizeLessonCore(
  input: SummarizeLessonInput
): Promise<SummarizeLessonOutput> {
  const openai = getOpenAI();

  const response = await openai.chat.completions.create({
    model: MODEL,
    max_tokens: MAX_TOKENS.memory,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          'Distill one actionable voice lesson for future posts. Return JSON: { "lesson": string } — one sentence, specific, reusable.',
      },
      {
        role: "user",
        content: `Topic: ${input.topic}
Score before: ${input.scoreBefore}/10
Human feedback: ${input.humanFeedback}
Problems: ${input.problems.join("; ")}
Judge feedback: ${input.judgeFeedback}`,
      },
    ],
  });

  const parsed = parseModelJson<{ lesson: string }>(
    response.choices[0]?.message?.content,
    { lesson: "" }
  );

  return { lesson: parsed.lesson, scoreBefore: input.scoreBefore };
}

export async function storeLessonCore(input: {
  task: string;
  niche: string;
  lesson: string;
  score_before: number;
  score_after?: number;
  post_type?: PostType;
  human_feedback?: string;
  judge_feedback?: string;
}): Promise<Lesson> {
  return storeLessonInRedis(input);
}

function shouldStoreRevisionLesson(input: OrchestrateInput): boolean {
  return Boolean(
    input.userFeedback?.trim() ||
      input.judgeRevisionContext?.trim() ||
      input.scoreBefore !== undefined
  );
}

function buildJudgeFeedbackForStore(
  input: OrchestrateInput,
  judged: JudgeOutput
): string {
  if (input.judgeRevisionContext?.trim()) {
    return input.judgeRevisionContext.trim();
  }
  const parts: string[] = [];
  if (judged.feedback) parts.push(judged.feedback);
  if (judged.problems.length > 0) {
    parts.push(`Problems: ${judged.problems.join("; ")}`);
  }
  return parts.join("\n");
}

async function maybeStoreRevisionLesson(
  input: OrchestrateInput,
  judged: JudgeOutput
): Promise<Lesson | undefined> {
  if (!shouldStoreRevisionLesson(input)) return undefined;

  const niche = input.niche ?? input.brandProfile.niche;
  const judgeFeedback = buildJudgeFeedbackForStore(input, judged);
  const humanFeedback =
    input.userFeedback?.trim() ?? "judge-driven retry";

  try {
    const summarized = await summarizeLessonCore({
      topic: input.topic,
      humanFeedback,
      judgeFeedback,
      problems: judged.problems,
      scoreBefore: input.scoreBefore ?? judged.score,
    });

    return await storeLessonInRedis({
      task: input.topic,
      niche,
      lesson: summarized.lesson,
      score_before: input.scoreBefore ?? judged.score,
      score_after: judged.score,
      human_feedback: input.userFeedback?.trim() || undefined,
      judge_feedback: judgeFeedback || undefined,
      post_type: input.postType,
    });
  } catch (error) {
    console.error("[maybeStoreRevisionLesson]", error);
    return undefined;
  }
}

async function maybeStorePostIndex(
  input: OrchestrateInput,
  attemptNumber: number,
  primaryVariant: LinkedInPost,
  judged: JudgeOutput
): Promise<string | undefined> {
  try {
    return await storePost({
      sessionId: input.sessionId,
      attemptNumber,
      topic: input.topic,
      niche: input.niche ?? input.brandProfile.niche,
      post: primaryVariant,
      judgeScore: judged.score,
      judgeFeedback: judged.feedback,
    });
  } catch (error) {
    console.error("[maybeStorePostIndex]", error);
    return undefined;
  }
}

export async function runOrchestratePostLoop(
  input: OrchestrateInput
): Promise<OrchestrateOutput> {
  const attemptNumber = input.attemptNumber ?? 1;
  const niche = input.niche ?? input.brandProfile.niche;
  const postType = input.postType ?? "story";
  const format: PostFormat = input.format ?? "text";

  const { lessons } = await searchMemoriesForTopic({
    query: input.topic,
    niche,
    postType,
  });

  let variants: LinkedInPost[];
  let systemDiagram: SystemDiagram | undefined;

  if (format === "carousel") {
    const generated = await generateCarouselCore({
      topic: input.topic,
      brandProfile: input.brandProfile,
      lessons,
      attemptNumber,
      postType,
      slideCount: input.slideCount,
      scoreBefore: input.scoreBefore,
      portraitImageUrl: input.portraitImageUrl,
      userFeedback: input.userFeedback,
      judgeRevisionContext: input.judgeRevisionContext,
    });
    variants = generated.variants;
  } else if (format === "diagram") {
    const generated = await generatePostCore({
      topic: input.topic,
      brandProfile: input.brandProfile,
      lessons,
      attemptNumber,
      postType,
      format: "text",
      scoreBefore: input.scoreBefore,
      userFeedback: input.userFeedback,
      judgeRevisionContext: input.judgeRevisionContext,
    });
    variants = generated.variants;
  } else {
    const generated = await generatePostCore({
      topic: input.topic,
      brandProfile: input.brandProfile,
      lessons,
      attemptNumber,
      postType,
      format: "text",
      scoreBefore: input.scoreBefore,
      userFeedback: input.userFeedback,
      judgeRevisionContext: input.judgeRevisionContext,
    });
    variants = await attachImageToVariants(
      generated.variants,
      input,
      input.imageUrl
    );
  }

  const primaryVariant = variants[0];
  if (!primaryVariant) {
    throw new Error("Generator returned no variants");
  }

  const judged = await judgePostCore({
    post: primaryVariant,
    brandProfile: input.brandProfile,
    topic: input.topic,
  });

  if (format === "diagram") {
    const diagramResult = await generateSystemDiagram({
      concept: input.topic,
      context: `LinkedIn niche: ${input.brandProfile.niche}. Audience: ${input.brandProfile.audience}. Voice: ${input.brandProfile.voice}.`,
    });
    const diagramImage = await generateDiagramImage(diagramResult.diagram, {
      brandName: input.brandProfile.name,
    });
    systemDiagram = diagramResult.diagram;
    variants = variants.map((v, i) =>
      i === 0
        ? {
            ...v,
            format: "diagram",
            image: diagramImage,
          }
        : v
    );
  }

  const attempt = {
    attemptNumber,
    topic: input.topic,
    variants,
    judgeScore: judged.score,
    problems: judged.problems,
    breakdown: judged.breakdown,
    judgeFeedback: judged.feedback,
    retrievedMemories: lessons,
    scoreBefore: input.scoreBefore,
    scoreAfter: judged.score,
    weaveTraceId: process.env.WEAVE_PROJECT,
    branding: input.branding,
    ...(systemDiagram ? { systemDiagram } : {}),
  };

  const finalVariant = variants[0];
  const [storedLesson, postIndexId] = await Promise.all([
    maybeStoreRevisionLesson(input, judged),
    maybeStorePostIndex(input, attemptNumber, finalVariant, judged),
  ]);

  return {
    attempt,
    weaveTraceId: process.env.WEAVE_PROJECT,
    storedLesson,
    postIndexId,
  };
}
