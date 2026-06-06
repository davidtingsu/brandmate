import { EMBEDDING_DIMENSIONS } from "@/lib/config";
import { embeddingToBuffer } from "@/lib/embeddings";
import type { Lesson, PostType } from "@/lib/types";
import { getRedis } from "./client";

const INDEX_NAME = "idx:lessons";
const KEY_PREFIX = "lesson:";

export async function ensureLessonIndex(): Promise<void> {
  const redis = await getRedis();

  try {
    await redis.ft.info(INDEX_NAME);
    return;
  } catch {
    // Index does not exist yet
  }

  await redis.sendCommand([
    "FT.CREATE",
    INDEX_NAME,
    "ON",
    "JSON",
    "PREFIX",
    "1",
    KEY_PREFIX,
    "SCHEMA",
    "$.task",
    "AS",
    "task",
    "TEXT",
    "$.niche",
    "AS",
    "niche",
    "TAG",
    "$.post_type",
    "AS",
    "post_type",
    "TAG",
    "$.task_type",
    "AS",
    "task_type",
    "TAG",
    "$.embedding",
    "AS",
    "embedding",
    "VECTOR",
    "HNSW",
    "6",
    "TYPE",
    "FLOAT32",
    "DIM",
    String(EMBEDDING_DIMENSIONS),
    "DISTANCE_METRIC",
    "COSINE",
  ]);
}

export interface SearchMemoriesOptions {
  queryEmbedding: number[];
  niche?: string;
  postType?: PostType;
  limit?: number;
}

export async function searchMemories(
  options: SearchMemoriesOptions
): Promise<Lesson[]> {
  const { queryEmbedding, niche, postType, limit = 3 } = options;
  await ensureLessonIndex();

  const redis = await getRedis();
  const vector = embeddingToBuffer(queryEmbedding);

  const filters: string[] = ['@task_type:{"linkedin_post"}'];
  if (niche) {
    filters.push(`@niche:{${escapeTag(niche)}}`);
  }
  if (postType) {
    filters.push(`@post_type:{${escapeTag(postType)}}`);
  }

  const filterQuery = filters.length ? `(${filters.join(" ")})` : "*";

  const results = await redis.ft.search(
    INDEX_NAME,
    `${filterQuery}=>[KNN ${limit} @embedding $BLOB AS score]`,
    {
      PARAMS: { BLOB: vector },
      SORTBY: "score",
      DIALECT: 2,
      RETURN: ["$.task", "$.niche", "$.post_type", "$.lesson", "$.score_before", "$.score_after", "$.human_feedback", "$.created_at"],
    }
  );

  return results.documents.map((doc) => {
    const id = doc.id.replace(KEY_PREFIX, "");
    const values = doc.value as Record<string, string>;
    return {
      id,
      task: values["$.task"] ?? "",
      task_type: "linkedin_post" as const,
      niche: values["$.niche"] ?? "",
      post_type: (values["$.post_type"] as PostType) || undefined,
      lesson: values["$.lesson"] ?? "",
      score_before: Number(values["$.score_before"] ?? 0),
      score_after: values["$.score_after"]
        ? Number(values["$.score_after"])
        : undefined,
      human_feedback: values["$.human_feedback"] as Lesson["human_feedback"],
      created_at: values["$.created_at"],
    };
  });
}

function escapeTag(value: string): string {
  return value.replace(/[,.<>{}[\]"\\':;!@#$%^&*()\-+=~]/g, "\\$&");
}
