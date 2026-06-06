import {
  logHumanFeedback,
  storeLessonOp,
  summarizeLesson,
} from "@/lib/weave/ops";
import type {
  HumanFeedbackType,
  Lesson,
  SummarizeLessonInput,
  SummarizeLessonOutput,
} from "@/lib/types";

export async function runSummarizeLesson(
  input: SummarizeLessonInput
): Promise<SummarizeLessonOutput> {
  return summarizeLesson(input);
}

export async function runStoreLesson(input: {
  task: string;
  niche: string;
  lesson: string;
  score_before: number;
  score_after?: number;
  post_type?: import("@/lib/types").PostType;
  human_feedback?: HumanFeedbackType;
}): Promise<Lesson> {
  return storeLessonOp(input);
}

export async function runLogHumanFeedback(input: {
  traceId?: string;
  feedbackType: HumanFeedbackType;
  scoreBefore?: number;
}) {
  return logHumanFeedback(input);
}
