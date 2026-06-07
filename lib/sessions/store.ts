import {
  createServerClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";
import type { ChatMessage, ChatThread } from "@/lib/types";

export function sessionsEnabled(): boolean {
  return isSupabaseConfigured();
}

export async function listThreads(userId: string): Promise<ChatThread[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("chat_threads")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as ChatThread[];
}

export async function createThread(
  userId: string,
  opts?: { title?: string; copilotThreadId?: string }
): Promise<ChatThread> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("chat_threads")
    .insert({
      user_id: userId,
      title: opts?.title ?? "New chat",
      copilot_thread_id: opts?.copilotThreadId ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as ChatThread;
}

export async function updateThread(
  threadId: string,
  updates: { title?: string; copilot_thread_id?: string }
): Promise<void> {
  const supabase = createServerClient();
  const { error } = await supabase
    .from("chat_threads")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", threadId);

  if (error) throw new Error(error.message);
}

export async function deleteThread(threadId: string): Promise<void> {
  const supabase = createServerClient();
  const { error } = await supabase
    .from("chat_threads")
    .delete()
    .eq("id", threadId);

  if (error) throw new Error(error.message);
}

export async function getThread(threadId: string): Promise<ChatThread | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("chat_threads")
    .select("*")
    .eq("id", threadId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as ChatThread | null;
}

export async function getMessages(threadId: string): Promise<ChatMessage[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as ChatMessage[];
}

export async function appendMessage(
  threadId: string,
  message: {
    role: string;
    content?: string | null;
    metadata?: Record<string, unknown>;
  }
): Promise<ChatMessage> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      thread_id: threadId,
      role: message.role,
      content: message.content ?? null,
      metadata: message.metadata ?? {},
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await supabase
    .from("chat_threads")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", threadId);

  return data as ChatMessage;
}
