import { embedText } from "@/lib/embeddings";
import { searchSimilarPosts } from "@/lib/redis/post-search";
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
    const embedding = await embedText(query);
    const similarPosts = await searchSimilarPosts({
      queryEmbedding: embedding,
      niche,
      excludeSessionId,
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
