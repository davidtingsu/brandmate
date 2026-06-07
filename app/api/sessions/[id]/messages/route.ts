import { getOrCreateUserId } from "@/lib/sessions/user-id";
import {
  appendMessage,
  getMessages,
  getThread,
  sessionsEnabled,
} from "@/lib/sessions/store";
import { formatError } from "@/lib/weave/errors";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    if (!sessionsEnabled()) {
      return NextResponse.json({ messages: [], enabled: false });
    }
    const userId = await getOrCreateUserId();
    const thread = await getThread(id);
    if (!thread || thread.user_id !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const messages = await getMessages(id);
    return NextResponse.json({ messages, enabled: true });
  } catch (error) {
    return NextResponse.json({ error: formatError(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    if (!sessionsEnabled()) {
      return NextResponse.json({ error: "Sessions disabled" }, { status: 503 });
    }
    const userId = await getOrCreateUserId();
    const thread = await getThread(id);
    if (!thread || thread.user_id !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const body = await req.json();
    const { role, content, metadata } = body as {
      role: string;
      content?: string;
      metadata?: Record<string, unknown>;
    };
    if (!role) {
      return NextResponse.json({ error: "role is required" }, { status: 400 });
    }
    const message = await appendMessage(id, { role, content, metadata });
    return NextResponse.json({ message });
  } catch (error) {
    return NextResponse.json({ error: formatError(error) }, { status: 500 });
  }
}
