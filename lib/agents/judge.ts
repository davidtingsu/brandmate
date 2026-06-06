import { judgePost } from "@/lib/weave/ops";
import type { JudgeInput, JudgeOutput } from "@/lib/types";

export async function runJudge(input: JudgeInput): Promise<JudgeOutput> {
  return judgePost(input);
}
