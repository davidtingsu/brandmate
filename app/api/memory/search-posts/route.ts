import { embedText } from "@/lib/embeddings";
import { searchSimilarPosts } from "@/lib/redis/post-search";
import { listThreads, sessionsEnabled } from "@/lib/sessions/store";
import { getOrCreateUserId } from "@/lib/sessions/user-id";
import { formatError } from "@/lib/weave/errors";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { topic, hook, body, niche, excludeSessionId, limit } =
      await req.json();

    if (!topic && !hook && !body) {
      return NextResponse.json(
        { error: "topic, hook, or body is required" },
        { status: 400 }
      );
    }

    const query = [topic, hook, body].filter(Boolean).join(" ");

    if (!sessionsEnabled()) {
      return NextResponse.json({ similarPosts: [], query });
    }

    const userId = await getOrCreateUserId();
    const threads = await listThreads(userId);
    const allowedSessionIds = threads.map((t) => t.id);

    const embedding = await embedText(query);
    const similarPosts = await searchSimilarPosts({
      queryEmbedding: embedding,
      niche,
      excludeSessionId,
      allowedSessionIds,
      limit: limit ?? 3,
    });

    return NextResponse.json({ similarPosts, query });
  } catch (error) {
    console.error("[memory search-posts]", error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}
