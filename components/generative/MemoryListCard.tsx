"use client";

import type { Lesson } from "@/lib/types";

interface MemoryListCardProps {
  lessons: Lesson[];
  topic?: string;
}

export function MemoryListCard({ lessons, topic }: MemoryListCardProps) {
  if (lessons.length === 0) return null;

  return (
    <div className="my-3 rounded-xl border border-violet-200 bg-violet-50 p-4 shadow-sm">
      <h3 className="mb-2 text-sm font-semibold text-violet-900">
        Retrieved memories
        {topic ? ` for "${topic}"` : ""}
      </h3>
      <ol className="list-inside list-decimal space-y-2 text-sm text-violet-800">
        {lessons.map((l) => (
          <li key={l.id}>
            <span className="font-medium">{l.lesson}</span>
            <span className="ml-1 text-xs text-violet-600">
              (from {l.score_before}/10)
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
