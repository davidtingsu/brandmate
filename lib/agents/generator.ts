import { generatePost } from "@/lib/weave/ops";
import type { GenerateInput, GenerateOutput } from "@/lib/types";

export async function runGenerator(
  input: GenerateInput
): Promise<GenerateOutput> {
  return generatePost(input);
}
