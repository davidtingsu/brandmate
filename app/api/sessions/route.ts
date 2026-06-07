import { buildThreadGalleryPreview } from "@/lib/sessions/gallery-preview";
import { getOrCreateUserId } from "@/lib/sessions/user-id";
import {
  createThread,
  listLatestAttemptsForThreads,
  listThreads,
  sessionsEnabled,
} from "@/lib/sessions/store";
import type { GalleryThread } from "@/lib/types";
import { formatError } from "@/lib/weave/errors";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    if (!sessionsEnabled()) {
      return NextResponse.json({ threads: [], enabled: false });
    }
    const userId = await getOrCreateUserId();
    const threads = await listThreads(userId);
    const attempts = await listLatestAttemptsForThreads(threads.map((t) => t.id));
    const galleryThreads: GalleryThread[] = threads.map((thread) => ({
      ...thread,
      ...buildThreadGalleryPreview(thread, attempts[thread.id]),
    }));
    return NextResponse.json({ threads: galleryThreads, enabled: true });
  } catch (error) {
    console.error("[sessions GET]", error);
    return NextResponse.json({ error: formatError(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!sessionsEnabled()) {
      return NextResponse.json(
        { error: "Sessions require Supabase configuration" },
        { status: 503 }
      );
    }
    const userId = await getOrCreateUserId();
    const body = await req.json().catch(() => ({}));
    const { title, copilotThreadId } = body as {
      title?: string;
      copilotThreadId?: string;
    };
    const thread = await createThread(userId, { title, copilotThreadId });
    return NextResponse.json({ thread });
  } catch (error) {
    console.error("[sessions POST]", error);
    return NextResponse.json({ error: formatError(error) }, { status: 500 });
  }
}
