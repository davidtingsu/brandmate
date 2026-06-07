import {
  runLogHumanFeedback,
  runStoreLesson,
  runSummarizeLesson,
} from "@/lib/agents/memory-summarizer";
import { initWeave } from "@/lib/weave/init";
import type { HumanFeedbackType, PostType } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await initWeave();
    const body = await req.json();
    const { action } = body as { action: string };

    if (action === "summarize") {
      const result = await runSummarizeLesson({
        topic: body.topic,
        judgeFeedback: body.judgeFeedback,
        humanFeedback: String(body.humanFeedback ?? ""),
        problems: body.problems ?? [],
        scoreBefore: body.scoreBefore,
      });
      return NextResponse.json(result);
    }

    if (action === "store") {
      const lesson = await runStoreLesson({
        task: body.task,
        niche: body.niche,
        lesson: body.lesson,
        score_before: body.score_before,
        score_after: body.score_after,
        post_type: body.post_type as PostType | undefined,
        human_feedback: body.human_feedback as string | undefined,
        judge_feedback: body.judge_feedback as string | undefined,
      });
      return NextResponse.json({ lesson });
    }

    if (action === "feedback") {
      const result = await runLogHumanFeedback({
        traceId: body.traceId,
        feedbackType: body.feedbackType as HumanFeedbackType,
        scoreBefore: body.scoreBefore,
      });
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("[memory agent]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Memory action failed" },
      { status: 500 }
    );
  }
}
