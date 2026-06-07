import { embedText } from "@/lib/embeddings";
import type { Lesson, PostType } from "@/lib/types";
import { getRedis } from "./client";
import { ensureLessonIndex } from "./vector-search";

const KEY_PREFIX = "lesson:";

export interface StoreLessonInput {
  task: string;
  niche: string;
  lesson: string;
  score_before: number;
  score_after?: number;
  post_type?: PostType;
  human_feedback?: string;
  judge_feedback?: string;
}

export async function storeLesson(input: StoreLessonInput): Promise<Lesson> {
  await ensureLessonIndex();
  const redis = await getRedis();

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const embedding = await embedText(`${input.task} ${input.lesson}`);

  const record = {
    task: input.task,
    task_type: "linkedin_post",
    niche: input.niche,
    post_type: input.post_type ?? "",
    lesson: input.lesson,
    score_before: input.score_before,
    score_after: input.score_after ?? null,
    human_feedback: input.human_feedback ?? null,
    judge_feedback: input.judge_feedback ?? null,
    created_at: new Date().toISOString(),
    embedding,
  };

  await redis.json.set(`${KEY_PREFIX}${id}`, "$", record);

  return {
    id,
    task: input.task,
    task_type: "linkedin_post",
    niche: input.niche,
    post_type: input.post_type,
    lesson: input.lesson,
    score_before: input.score_before,
    score_after: input.score_after,
    human_feedback: input.human_feedback,
    judge_feedback: input.judge_feedback,
    created_at: record.created_at,
  };
}

export async function listLessons(niche?: string, limit = 10): Promise<Lesson[]> {
  await ensureLessonIndex();
  const redis = await getRedis();
  const keys = await redis.keys(`${KEY_PREFIX}*`);
  const lessons: Lesson[] = [];

  for (const key of keys.slice(0, limit * 2)) {
    const data = (await redis.json.get(key)) as Record<string, unknown> | null;
    if (!data) continue;
    if (niche && data.niche !== niche) continue;

    lessons.push({
      id: key.replace(KEY_PREFIX, ""),
      task: String(data.task ?? ""),
      task_type: "linkedin_post",
      niche: String(data.niche ?? ""),
      post_type: (data.post_type as PostType) || undefined,
      lesson: String(data.lesson ?? ""),
      score_before: Number(data.score_before ?? 0),
      score_after: data.score_after ? Number(data.score_after) : undefined,
      human_feedback: data.human_feedback
        ? String(data.human_feedback)
        : undefined,
      judge_feedback: data.judge_feedback
        ? String(data.judge_feedback)
        : undefined,
      created_at: data.created_at as string | undefined,
    });
  }

  return lessons.slice(0, limit);
}
