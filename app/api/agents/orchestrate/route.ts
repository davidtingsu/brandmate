import { runPostLoop } from "@/lib/agents/orchestrator";
import { formatError } from "@/lib/weave/errors";
import { initWeave } from "@/lib/weave/init";
import type { BrandProfile, PostBrandingOptions, PostType } from "@/lib/types";
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
      format,
      includeImage,
      imageStyle,
      imageUrl,
      portraitImageUrl,
      slideCount,
      scoreBefore,
      branding,
      userFeedback,
      judgeRevisionContext,
    }: {
      topic: string;
      brandProfile: BrandProfile;
      attemptNumber?: number;
      postType?: PostType;
      format?: "text" | "carousel";
      includeImage?: boolean;
      imageStyle?: string;
      imageUrl?: string;
      portraitImageUrl?: string;
      slideCount?: number;
      scoreBefore?: number;
      branding?: PostBrandingOptions;
      userFeedback?: string;
      judgeRevisionContext?: string;
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
      format,
      includeImage,
      imageStyle,
      imageUrl,
      portraitImageUrl,
      slideCount,
      scoreBefore,
      branding,
      userFeedback,
      judgeRevisionContext,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[orchestrate]", error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}
