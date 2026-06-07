import { linkPostMessage } from "@/lib/redis/post-store";
import { formatError } from "@/lib/weave/errors";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, attemptNumber, messageId } = await req.json();

    if (!sessionId || attemptNumber === undefined || !messageId) {
      return NextResponse.json(
        { error: "sessionId, attemptNumber, and messageId are required" },
        { status: 400 }
      );
    }

    await linkPostMessage({
      sessionId,
      attemptNumber: Number(attemptNumber),
      messageId,
    });

    return NextResponse.json({ linked: true });
  } catch (error) {
    console.error("[memory posts link]", error);
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 }
    );
  }
}
