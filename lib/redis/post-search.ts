import { EMBEDDING_DIMENSIONS } from "@/lib/config";
import { embeddingToBuffer } from "@/lib/embeddings";
import { getPreviewText } from "@/lib/sessions/gallery-preview";
import type { LinkedInPost, PostType, SimilarPost } from "@/lib/types";
import { getRedis } from "./client";

const INDEX_NAME = "idx:posts";
const KEY_PREFIX = "post:";

export async function ensurePostIndex(): Promise<void> {
  const redis = await getRedis();

  try {
    await redis.ft.info(INDEX_NAME);
    return;
  } catch {
    // Index does not exist yet
  }

  try {
    await redis.sendCommand([
      "FT.CREATE",
      INDEX_NAME,
      "ON",
      "JSON",
      "PREFIX",
      "1",
      KEY_PREFIX,
      "SCHEMA",
      "$.topic",
      "AS",
      "topic",
      "TEXT",
      "$.niche",
      "AS",
      "niche",
      "TAG",
      "$.post_type",
      "AS",
      "post_type",
      "TAG",
      "$.session_id",
      "AS",
      "session_id",
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
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("unknown command 'FT.CREATE'")) {
      throw new Error(
        "Redis search module not available. Run: docker compose up -d and set REDIS_URL=redis://localhost:6380"
      );
    }
    throw error;
  }
}

export interface SearchSimilarPostsOptions {
  queryEmbedding: number[];
  niche?: string;
  excludeSessionId?: string;
  limit?: number;
}

export async function searchSimilarPosts(
  options: SearchSimilarPostsOptions
): Promise<SimilarPost[]> {
  const { queryEmbedding, niche, excludeSessionId, limit = 3 } = options;
  await ensurePostIndex();

  const redis = await getRedis();
  const vector = embeddingToBuffer(queryEmbedding);

  const filters: string[] = [];
  if (niche) {
    filters.push(`@niche:{${escapeTag(niche)}}`);
  }
  if (excludeSessionId) {
    filters.push(`-@session_id:{${escapeTag(excludeSessionId)}}`);
  }

  const filterQuery = filters.length ? `(${filters.join(" ")})` : "*";

  const results = await redis.ft.search(
    INDEX_NAME,
    `${filterQuery}=>[KNN ${limit + 2} @embedding $BLOB AS score]`,
    {
      PARAMS: { BLOB: vector },
      SORTBY: "score",
      DIALECT: 2,
      RETURN: [
        "$.session_id",
        "$.topic",
        "$.hook",
        "$.body",
        "$.preview_image_url",
        "$.post_type",
        "$.format",
        "$.judge_score",
        "$.created_at",
        "$.niche",
      ],
    }
  );

  const posts: SimilarPost[] = [];

  for (const doc of results.documents) {
    const id = doc.id.replace(KEY_PREFIX, "");
    const values = doc.value as Record<string, string>;
    const sessionId = values["$.session_id"] ?? "";

    if (excludeSessionId && sessionId === excludeSessionId) continue;

    const hook = values["$.hook"] ?? "";
    const body = values["$.body"] ?? "";
    const topic = values["$.topic"] ?? "";

    const stubPost: LinkedInPost = {
      format: (values["$.format"] as LinkedInPost["format"]) ?? "text",
      hook,
      body,
      cta: "",
      hashtags: [],
      postType: (values["$.post_type"] as PostType) ?? "story",
      characterCount: 0,
    };

    posts.push({
      id,
      sessionId,
      topic,
      hook,
      body,
      previewImageUrl: values["$.preview_image_url"] || undefined,
      previewText: getPreviewText(stubPost),
      niche: values["$.niche"] ?? "",
      postType: (values["$.post_type"] as PostType) || undefined,
      format: stubPost.format,
      judgeScore: values["$.judge_score"]
        ? Number(values["$.judge_score"])
        : undefined,
      createdAt: values["$.created_at"],
    });

    if (posts.length >= limit) break;
  }

  return posts;
}

function escapeTag(value: string): string {
  return value.replace(/[,.<>{}[\]"\\':;!@#$%^&*()\-+=~]/g, "\\$&");
}
