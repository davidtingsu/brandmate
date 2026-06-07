import { storeLesson } from "@/lib/redis/lesson-store";
import { initWeave } from "@/lib/weave/init";
import { storeLessonOp } from "@/lib/weave/ops";
import type { PostType } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await initWeave();
    const body = await req.json();
    const { traced, ...input } = body;

    if (traced) {
      const lesson = await storeLessonOp({
        task: input.task,
        niche: input.niche,
        lesson: input.lesson,
        score_before: input.score_before,
        score_after: input.score_after,
        post_type: input.post_type as PostType | undefined,
        human_feedback: input.human_feedback as string | undefined,
        judge_feedback: input.judge_feedback as string | undefined,
      });
      return NextResponse.json({ lesson });
    }

    const lesson = await storeLesson({
      task: input.task,
      niche: input.niche,
      lesson: input.lesson,
      score_before: input.score_before,
      score_after: input.score_after,
      post_type: input.post_type as PostType | undefined,
      human_feedback: input.human_feedback as string | undefined,
      judge_feedback: input.judge_feedback as string | undefined,
    });

    return NextResponse.json({ lesson });
  } catch (error) {
    console.error("[memory store]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Store failed" },
      { status: 500 }
    );
  }
}
