import { embedText } from "@/lib/embeddings";
import { MAX_LESSONS_IN_PROMPT, MAX_TOKENS } from "@/lib/config";
import { buildLinkedInPost } from "@/lib/linkedin-format";
import { searchMemories } from "@/lib/redis/vector-search";
import { storeLesson as storeLessonInRedis } from "@/lib/redis/lesson-store";
import type {
  GenerateInput,
  GenerateOutput,
  HumanFeedbackType,
  JudgeInput,
  JudgeOutput,
  Lesson,
  OrchestrateInput,
  OrchestrateOutput,
  PostType,
  SummarizeLessonInput,
  SummarizeLessonOutput,
} from "@/lib/types";
import { getOpenAI, MODEL } from "@/lib/weave/openai";

async function parseJson<T>(content: string): Promise<T> {
  const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
  return JSON.parse(cleaned) as T;
}

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
  const lessonsText =
    input.lessons.length > 0
      ? input.lessons.map((l, i) => `${i + 1}. ${l.lesson}`).join("\n")
      : "No prior lessons.";

  const scoreContext =
    input.scoreBefore !== undefined
      ? `Previous attempt scored ${input.scoreBefore}/10. Improve specifically on prior weaknesses.`
      : "";

  const response = await openai.chat.completions.create({
    model: MODEL,
    max_tokens: MAX_TOKENS.generate,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You write LinkedIn posts for personal brand growth. Return JSON: { "variants": [ { "hook", "body", "cta", "hashtags": string[], "postType" } ] } with exactly 2 variants (A/B). Post type: ${postType}. Keep under 1300 chars each. Apply learned lessons.`,
      },
      {
        role: "user",
        content: `Topic: ${input.topic}
Brand: ${input.brandProfile.name} | Niche: ${input.brandProfile.niche}
Audience: ${input.brandProfile.audience}
Voice: ${input.brandProfile.voice}
Attempt: ${input.attemptNumber}
${scoreContext}

Learned lessons:
${lessonsText}`,
      },
    ],
  });

  const raw = await parseJson<{
    variants: Array<{
      hook: string;
      body: string;
      cta?: string;
      hashtags?: string[];
      postType?: string;
    }>;
  }>(response.choices[0]?.message?.content ?? '{"variants":[]}');

  const variants = raw.variants.map((v) =>
    buildLinkedInPost({
      hook: v.hook,
      body: v.body,
      cta: v.cta,
      hashtags: v.hashtags,
      postType: v.postType ?? postType,
    })
  );

  return { variants, attemptNumber: input.attemptNumber, postType };
}

export async function judgePostCore(input: JudgeInput): Promise<JudgeOutput> {
  const openai = getOpenAI();
  const postText = `${input.post.hook}\n\n${input.post.body}\n\n${input.post.cta}`;

  const response = await openai.chat.completions.create({
    model: MODEL,
    max_tokens: MAX_TOKENS.judge,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You judge LinkedIn posts for personal brand growth. Return JSON: { "score": number (1-10), "breakdown": { "hook_strength", "voice_authenticity", "audience_fit", "engagement_potential", "brand_alignment" }, "problems": string[], "feedback": string }. Weights: hook 25%, voice 25%, audience 20%, engagement 15%, brand 15%.`,
      },
      {
        role: "user",
        content: `Topic: ${input.topic}
Brand voice: ${input.brandProfile.voice}
Audience: ${input.brandProfile.audience}

Post:
${postText}`,
      },
    ],
  });

  return parseJson<JudgeOutput>(
    response.choices[0]?.message?.content ??
      '{"score":5,"breakdown":{"hook_strength":5,"voice_authenticity":5,"audience_fit":5,"engagement_potential":5,"brand_alignment":5},"problems":[],"feedback":""}'
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

  const parsed = await parseJson<{ lesson: string }>(
    response.choices[0]?.message?.content ?? '{"lesson":""}'
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
  human_feedback?: HumanFeedbackType;
}): Promise<Lesson> {
  return storeLessonInRedis(input);
}

export async function runOrchestratePostLoop(
  input: OrchestrateInput
): Promise<OrchestrateOutput> {
  const attemptNumber = input.attemptNumber ?? 1;
  const niche = input.niche ?? input.brandProfile.niche;
  const postType = input.postType ?? "story";

  const { lessons } = await searchMemoriesForTopic({
    query: input.topic,
    niche,
    postType,
  });

  const generated = await generatePostCore({
    topic: input.topic,
    brandProfile: input.brandProfile,
    lessons,
    attemptNumber,
    postType,
    scoreBefore: input.scoreBefore,
  });

  const primaryVariant = generated.variants[0];
  if (!primaryVariant) {
    throw new Error("Generator returned no variants");
  }

  const judged = await judgePostCore({
    post: primaryVariant,
    brandProfile: input.brandProfile,
    topic: input.topic,
  });

  const attempt = {
    attemptNumber,
    topic: input.topic,
    variants: generated.variants,
    judgeScore: judged.score,
    problems: judged.problems,
    breakdown: judged.breakdown,
    retrievedMemories: lessons,
    scoreBefore: input.scoreBefore,
    scoreAfter: judged.score,
    weaveTraceId: process.env.WEAVE_PROJECT,
  };

  return {
    attempt,
    weaveTraceId: process.env.WEAVE_PROJECT,
  };
}
