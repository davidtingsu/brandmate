import { embedText } from "@/lib/embeddings";
import { searchMemories } from "@/lib/redis/vector-search";
import { initWeave } from "@/lib/weave/init";
import { searchMemoriesOp } from "@/lib/weave/ops";
import type { PostType } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await initWeave();
    const { query, niche, postType, traced } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }

    if (traced) {
      const result = await searchMemoriesOp({
        query,
        niche,
        postType: postType as PostType | undefined,
      });
      return NextResponse.json(result);
    }

    const embedding = await embedText(query);
    const lessons = await searchMemories({
      queryEmbedding: embedding,
      niche,
      postType: postType as PostType | undefined,
    });

    return NextResponse.json({ lessons, query });
  } catch (error) {
    console.error("[memory search]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Search failed" },
      { status: 500 }
    );
  }
}
