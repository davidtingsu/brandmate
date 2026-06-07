import { getOrCreateUserId } from "@/lib/sessions/user-id";
import {
  deleteThread,
  getThread,
  sessionsEnabled,
  updateThread,
} from "@/lib/sessions/store";
import { formatError } from "@/lib/weave/errors";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    if (!sessionsEnabled()) {
      return NextResponse.json({ error: "Sessions disabled" }, { status: 503 });
    }
    const thread = await getThread(id);
    if (!thread) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ thread });
  } catch (error) {
    return NextResponse.json({ error: formatError(error) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    if (!sessionsEnabled()) {
      return NextResponse.json({ error: "Sessions disabled" }, { status: 503 });
    }
    const body = await req.json();
    await updateThread(id, body);
    const thread = await getThread(id);
    return NextResponse.json({ thread });
  } catch (error) {
    return NextResponse.json({ error: formatError(error) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
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
    await deleteThread(id);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return NextResponse.json({ error: formatError(error) }, { status: 500 });
  }
}
