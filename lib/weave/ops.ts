import * as weave from "weave";
import {
  generatePostCore,
  judgePostCore,
  runOrchestratePostLoop,
  searchMemoriesForTopic,
  storeLessonCore,
  summarizeLessonCore,
} from "@/lib/pipeline/post-loop";
import type { HumanFeedbackType, PostType } from "@/lib/types";
import { ensureWeave } from "./init";

export const searchMemoriesOp = weave.op(async function searchMemoriesOp(args: {
  query: string;
  niche?: string;
  postType?: PostType;
}) {
  await ensureWeave();
  return searchMemoriesForTopic(args);
});

export const generatePost = weave.op(async function generatePost(
  input: Parameters<typeof generatePostCore>[0]
) {
  await ensureWeave();
  return generatePostCore(input);
});

export const judgePost = weave.op(async function judgePost(
  input: Parameters<typeof judgePostCore>[0]
) {
  await ensureWeave();
  return judgePostCore(input);
});

export const summarizeLesson = weave.op(async function summarizeLesson(
  input: Parameters<typeof summarizeLessonCore>[0]
) {
  await ensureWeave();
  return summarizeLessonCore(input);
});

export const storeLessonOp = weave.op(async function storeLessonOp(input: {
  task: string;
  niche: string;
  lesson: string;
  score_before: number;
  score_after?: number;
  post_type?: PostType;
  human_feedback?: string;
  judge_feedback?: string;
}) {
  await ensureWeave();
  return storeLessonCore(input);
});

export const logHumanFeedback = weave.op(async function logHumanFeedback({
  traceId,
  feedbackType,
  scoreBefore,
}: {
  traceId?: string;
  feedbackType: HumanFeedbackType;
  scoreBefore?: number;
}) {
  await ensureWeave();
  return { traceId, feedbackType, scoreBefore };
});

export const orchestratePostLoop = weave.op(async function orchestratePostLoop(
  input: Parameters<typeof runOrchestratePostLoop>[0]
) {
  await ensureWeave();
  return runOrchestratePostLoop(input);
});
