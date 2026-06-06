import { runPostLoop } from "@/lib/agents/orchestrator";
import { initWeave } from "@/lib/weave/init";
import type { BrandProfile, PostType } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await initWeave();
    const body = await req.json();
    const {
      topic,
      brandProfile,
      attemptNumber,
      postType,
      scoreBefore,
    }: {
      topic: string;
      brandProfile: BrandProfile;
      attemptNumber?: number;
      postType?: PostType;
      scoreBefore?: number;
    } = body;

    if (!topic || !brandProfile?.name) {
      return NextResponse.json(
        { error: "topic and brandProfile are required" },
        { status: 400 }
      );
    }

    const result = await runPostLoop({
      topic,
      brandProfile,
      attemptNumber,
      postType,
      scoreBefore,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[orchestrate]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Orchestration failed" },
      { status: 500 }
    );
  }
}
