import { embedText } from "@/lib/embeddings";
import { getFirstPostImage } from "@/lib/sessions/gallery-preview";
import type { LinkedInPost, PostType } from "@/lib/types";
import { getRedis } from "./client";
import { ensurePostIndex } from "./post-search";

const KEY_PREFIX = "post:";

export interface StorePostInput {
  sessionId?: string;
  attemptNumber: number;
  topic: string;
  niche: string;
  post: LinkedInPost;
  judgeScore: number;
  judgeFeedback?: string;
}

function buildPostKey(sessionId: string | undefined, attemptNumber: number): string {
  if (sessionId) {
    return `${KEY_PREFIX}${sessionId}:${attemptNumber}`;
  }
  return `${KEY_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function storePost(input: StorePostInput): Promise<string> {
  await ensurePostIndex();
  const redis = await getRedis();

  const id = input.sessionId
    ? `${input.sessionId}:${input.attemptNumber}`
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const key = `${KEY_PREFIX}${id}`;
  const { post } = input;
  const embedding = await embedText(
    `${input.topic} ${post.hook} ${post.body}`.trim()
  );

  const record = {
    session_id: input.sessionId ?? "",
    message_id: "",
    attempt_number: input.attemptNumber,
    topic: input.topic,
    niche: input.niche,
    post_type: post.postType,
    format: post.format,
    hook: post.hook,
    body: post.body,
    preview_image_url: getFirstPostImage(post) ?? null,
    judge_score: input.judgeScore,
    judge_feedback: input.judgeFeedback ?? null,
    created_at: new Date().toISOString(),
    embedding,
  };

  await redis.json.set(key, "$", record);
  return id;
}

export async function linkPostMessage(input: {
  sessionId: string;
  attemptNumber: number;
  messageId: string;
}): Promise<void> {
  await ensurePostIndex();
  const redis = await getRedis();
  const key = buildPostKey(input.sessionId, input.attemptNumber);

  const exists = await redis.exists(key);
  if (!exists) return;

  await redis.json.set(key, "$.message_id", input.messageId);
}
