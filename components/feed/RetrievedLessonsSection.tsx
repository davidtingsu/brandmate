"use client";

import { MemoryListCard } from "@/components/generative/MemoryListCard";
import type { Lesson } from "@/lib/types";

interface RetrievedLessonsSectionProps {
  lessons: Lesson[];
  topic?: string;
}

export function RetrievedLessonsSection({
  lessons,
  topic,
}: RetrievedLessonsSectionProps) {
  if (lessons.length === 0) return null;

  return (
    <section className="mt-8 border-t border-slate-200 pt-6">
      <MemoryListCard lessons={lessons} topic={topic} />
    </section>
  );
}
