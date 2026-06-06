import {
  storeLessonCore,
  summarizeLessonCore,
} from "@/lib/pipeline/post-loop";
import type {
  HumanFeedbackType,
  Lesson,
  SummarizeLessonInput,
  SummarizeLessonOutput,
} from "@/lib/types";
import { disableWeave, isWeaveEnabled } from "@/lib/weave/init";
import { formatError, isWeaveTraceError } from "@/lib/weave/errors";
import {
  logHumanFeedback,
  storeLessonOp,
  summarizeLesson,
} from "@/lib/weave/ops";

async function withWeaveFallback<T>(
  traced: () => Promise<T>,
  fallback: () => Promise<T>
): Promise<T> {
  if (!isWeaveEnabled()) return fallback();
  try {
    return await traced();
  } catch (error) {
    if (isWeaveTraceError(error)) {
      disableWeave(formatError(error));
      return fallback();
    }
    throw error;
  }
}

export async function runSummarizeLesson(
  input: SummarizeLessonInput
): Promise<SummarizeLessonOutput> {
  return withWeaveFallback(
    () => summarizeLesson(input),
    () => summarizeLessonCore(input)
  );
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
  return withWeaveFallback(
    () => storeLessonOp(input),
    () => storeLessonCore(input)
  );
}

export async function runLogHumanFeedback(input: {
  traceId?: string;
  feedbackType: HumanFeedbackType;
  scoreBefore?: number;
}) {
  if (!isWeaveEnabled()) return input;
  return withWeaveFallback(
    () => logHumanFeedback(input),
    async () => input
  );
}
