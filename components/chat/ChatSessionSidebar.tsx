"use client";

import { useChatSessionContext } from "@/contexts/ChatSessionContext";
import type { ChatThread } from "@/lib/types";

interface ChatSessionSidebarProps {
  onNewChat: () => void;
  onSelectThread: (thread: ChatThread) => void;
}

export function ChatSessionSidebar({
  onNewChat,
  onSelectThread,
}: ChatSessionSidebarProps) {
  const {
    threads,
    activeSessionId,
    sessionsEnabled,
    loading,
    setThreads,
  } = useChatSessionContext();

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this chat session?")) return;
    const res = await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    if (!res.ok) return;
    setThreads(threads.filter((t) => t.id !== id));
    if (activeSessionId === id) onNewChat();
  };

  if (!sessionsEnabled) {
    return (
      <aside className="w-64 shrink-0 border-r border-slate-200 bg-slate-50 p-4">
        <p className="text-xs text-slate-500">
          Add Supabase env vars to enable saved chat sessions.
        </p>
      </aside>
    );
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-slate-50">
      <div className="border-b border-slate-200 p-3">
        <button
          type="button"
          onClick={onNewChat}
          className="w-full rounded-lg bg-linkedin px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + New chat
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <p className="p-2 text-xs text-slate-500">Loading sessions...</p>
        ) : threads.length === 0 ? (
          <p className="p-2 text-xs text-slate-500">No saved chats yet</p>
        ) : (
          <ul className="space-y-1">
            {threads.map((thread) => (
              <li key={thread.id}>
                <button
                  type="button"
                  onClick={() => onSelectThread(thread)}
                  className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${
                    activeSessionId === thread.id
                      ? "bg-white font-medium text-slate-900 shadow-sm"
                      : "text-slate-700 hover:bg-white/80"
                  }`}
                >
                  <span className="truncate">
                    {thread.title ?? "Untitled chat"}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(thread.id, e)}
                    className="ml-1 shrink-0 text-xs text-slate-400 opacity-0 hover:text-red-600 group-hover:opacity-100"
                    aria-label="Delete session"
                  >
                    ×
                  </button>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
